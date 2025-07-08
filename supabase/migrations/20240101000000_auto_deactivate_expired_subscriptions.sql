-- Add column to track which subscriptions were active before payment failure
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS was_active_before_payment_failure BOOLEAN DEFAULT NULL;

-- Function to automatically deactivate user subscriptions when payment subscription becomes invalid
CREATE OR REPLACE FUNCTION auto_deactivate_expired_subscriptions()
RETURNS TRIGGER AS $$
DECLARE
    is_valid_payment BOOLEAN := FALSE;
    was_payment_valid BOOLEAN := FALSE;
BEGIN
    -- Check if the payment subscription is in a valid state
    -- Valid if: status is 'active' or 'trialing' AND we're within the current period
    IF NEW.status IN ('active', 'trialing') 
       AND NEW.current_period_start IS NOT NULL 
       AND NEW.current_period_end IS NOT NULL 
       AND NOW() >= NEW.current_period_start 
       AND NOW() <= NEW.current_period_end THEN
        is_valid_payment := TRUE;
    END IF;

    -- Check if payment was previously valid
    IF OLD.status IS NOT NULL 
       AND OLD.status IN ('active', 'trialing')
       AND OLD.current_period_start IS NOT NULL 
       AND OLD.current_period_end IS NOT NULL 
       AND NOW() >= OLD.current_period_start 
       AND NOW() <= OLD.current_period_end THEN
        was_payment_valid := TRUE;
    END IF;

    -- If payment is now invalid but was valid before, deactivate all brand subscriptions
    IF NOT is_valid_payment AND was_payment_valid THEN
        -- First, save which subscriptions were active before deactivating them
        UPDATE user_subscriptions 
        SET was_active_before_payment_failure = is_active
        WHERE user_id = NEW.user_id 
          AND is_active = TRUE;
        
        -- Then deactivate all active subscriptions
        UPDATE user_subscriptions 
        SET is_active = FALSE, 
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
          AND is_active = TRUE;
        
        RAISE NOTICE 'Deactivated all brand subscriptions for user % due to invalid payment status: %', NEW.user_id, NEW.status;
    END IF;

    -- If payment is now valid but was invalid before, reactivate previously active subscriptions
    IF is_valid_payment AND NOT was_payment_valid THEN
        -- Only reactivate subscriptions that were active before payment failure
        UPDATE user_subscriptions 
        SET is_active = TRUE,
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
          AND was_active_before_payment_failure = TRUE
          AND is_active = FALSE;
        
        -- Clear the tracking column
        UPDATE user_subscriptions 
        SET was_active_before_payment_failure = NULL
        WHERE user_id = NEW.user_id;
        
        RAISE NOTICE 'Reactivated previously active brand subscriptions for user % due to valid payment status: %', NEW.user_id, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after INSERT or UPDATE on user_payment_subscriptions
DROP TRIGGER IF EXISTS trigger_auto_deactivate_expired_subscriptions ON user_payment_subscriptions;
CREATE TRIGGER trigger_auto_deactivate_expired_subscriptions
    AFTER INSERT OR UPDATE ON user_payment_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION auto_deactivate_expired_subscriptions(); 