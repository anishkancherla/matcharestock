"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-6 border-b border-black bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-black hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-black font-diatype">Terms of Service</h1>
            <p className="text-black font-diatype">
              Last updated: July 11, 2025
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 bg-white">
        <div className="prose prose-black max-w-none">
          <div className="space-y-8 text-black">
            <p className="text-black">
              Welcome to MatchaRestock ("MatchaRestock," "we," "us," or "our"). These Terms of Use ("Terms") are a legally binding contract between you ("you" or "user") and MatchaRestock, covering your access to and use of the MatchaRestock website, emails, and any related services (collectively, the "Service"). By creating an account, checking the "I agree" box, or simply using the Service, you agree to these Terms. If you do not agree, please do not use MatchaRestock.
            </p>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">1. What We Do</h2>
              <p className="text-black">
                MatchaRestock is an independent notification tool that emails you when selected matcha products appear back in stock. We are not affiliated with or endorsed by Ippodo, Marukyu Koyamaen, or any other brand. All product names, logos, and trademarks belong to their respective owners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">2. Your Account</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li><strong>Age & capacity.</strong> You must be at least 13 years old and able to form a binding contract.</li>
                <li><strong>Sign-in.</strong> You can create an account with an email address or sign in with Google OAuth.</li>
                <li><strong>Accuracy.</strong> Keep your contact details current so we can send alerts.</li>
                <li><strong>Security.</strong> Safeguard your password and limit access to your device. You are responsible for all activity under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">3. Email Delivery – Best-Effort Only</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li>We rely on third-party email providers and the rules of recipients' mail servers.</li>
                <li>Emails can be delayed, sent to spam, or never delivered.</li>
                <li>Before purchasing, always confirm stock on the retailer's website.</li>
                <li>We are not liable for missed or late alerts or for any decision you make based on our emails or on-site data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">4. Subscriptions & Payments</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li><strong>Paid plan.</strong> Payments are handled by Stripe; we never see or store your full card number.</li>
                <li><strong>Renewals & cancellation.</strong> Plans renew automatically until you cancel in your dashboard. No refunds for partial billing periods unless required by law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">5. Acceptable Use</h2>
              <p className="text-black mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li>Use the Service for unlawful, deceptive, or harmful purposes.</li>
                <li>Attempt to copy, scrape, or reverse-engineer our software without permission.</li>
                <li>Upload malware or interfere with our servers.</li>
                <li>Impersonate another person or misrepresent your affiliation with any entity.</li>
              </ul>
              <p className="text-black mt-4">We may suspend or terminate your account if we believe you have violated these Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">6. Intellectual Property</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li>All MatchaRestock code, text, and graphics are owned by us or our licensors.</li>
                <li>You may view, copy, and print pages for personal, non-commercial use only.</li>
                <li>Any rights not expressly granted to you are reserved by MatchaRestock.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">7. Privacy</h2>
              <p className="text-black">
                We collect the minimum personal data necessary: your email address, Google OAuth ID (if used), and Stripe payment tokens. For full details, see our separate <Link href="/privacy-policy" className="text-black underline">Privacy Policy</Link>. By using the Service, you consent to that policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">8. Disclaimers</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li><strong>Information accuracy.</strong> Stock data may change rapidly or be inaccurate.</li>
                <li><strong>No warranties.</strong> The Service is provided "as is" and "as available," without any express or implied warranty (including merchantability, fitness for a particular purpose, title, or non-infringement).</li>
                <li><strong>Third-party links.</strong> We may link to external sites we do not control; we are not responsible for their content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">9. Limitation of Liability</h2>
              <p className="text-black mb-4">
                To the fullest extent permitted by law, MatchaRestock, its owners, and contributors will not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, or for any loss of profits, revenues, data, goodwill, or other intangible losses, arising from or related to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li>missed, delayed, or inaccurate alerts;</li>
                <li>reliance on any information provided by the Service;</li>
                <li>technical issues, downtime, or server lags;</li>
                <li>transactions or decisions you make after receiving an alert.</li>
              </ul>
              <p className="text-black mt-4">
                If a court finds us liable despite the above, our total liability for all claims will not exceed USD $100 (or the minimum amount required by law).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">10. Indemnification</h2>
              <p className="text-black">
                You agree to defend, indemnify, and hold harmless MatchaRestock and its affiliates from any claims, damages, and expenses (including reasonable attorney's fees) arising out of your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">11. Termination</h2>
              <p className="text-black">
                We may suspend or terminate your access at any time, with or without notice, if we believe you have breached these Terms or for any business reason. You may stop using the Service and delete your account at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">12. Changes to the Terms</h2>
              <p className="text-black">
                We may update these Terms from time to time. We will post the new version with a new "Last updated" date and, for material changes, notify you by email. Continuing to use the Service after changes take effect means you accept the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">13. Governing Law</h2>
              <p className="text-black">
                These Terms are governed by the laws of the State of California, USA, without regard to conflict-of-laws principles. Any dispute will be resolved exclusively in the state or federal courts located in Los Angeles County, California. You and MatchaRestock consent to personal jurisdiction there.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">14. Contact</h2>
              <p className="text-black">
                Questions? Email <a href="mailto:matcharestock@gmail.com" className="text-black underline">matcharestock@gmail.com</a>.
              </p>
              <p className="text-black mt-4">
                By using MatchaRestock, you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
} 