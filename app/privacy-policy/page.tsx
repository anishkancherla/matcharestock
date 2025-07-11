"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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
            <h1 className="text-2xl font-bold text-black font-diatype">Privacy Policy</h1>
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
              Your privacy matters. This page explains what data we collect, why we collect it, and what you can do about it. By using MatchaRestock ("we," "us," "our," or "the Service"), you agree to the practices described below. If anything here worries you, please email <a href="mailto:matcharestock@gmail.com" className="text-black underline">matcharestock@gmail.com</a> before continuing.
            </p>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">1. The Very Short Version</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li>We only collect what we need: your email, a Google OAuth ID if you sign in with Google, and a Stripe customer token if you have a paid plan.</li>
                <li>We don't sell or rent your details.</li>
                <li>We don't see your card number. Stripe handles all payments.</li>
                <li>You're in control: unsubscribe or delete your account at any time.</li>
              </ul>
              <p className="text-black mt-4">If you want the full story, read on.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">2. Who We Are</h2>
              <p className="text-black">
                MatchaRestock is an independent web tool that emails you when selected matcha products come back in stock. Our website is at <a href="https://matcharestock.com" className="text-black underline">https://matcharestock.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">3. Personal Data We Collect</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-3 text-left text-black font-semibold">Category</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">What it is</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">Why we need it</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">Can you remove it?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-3 text-black">Email address</td>
                      <td className="border border-black p-3 text-black">The address you enter at sign-up</td>
                      <td className="border border-black p-3 text-black">• Create your account<br/>• Send restock alerts<br/>• Account messages (password reset, policy updates)</td>
                      <td className="border border-black p-3 text-black">Yes – click "unsubscribe" or delete your account</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Google OAuth ID (optional)</td>
                      <td className="border border-black p-3 text-black">Secure token from Google if you use "Continue with Google"</td>
                      <td className="border border-black p-3 text-black">Let you log in without a password</td>
                      <td className="border border-black p-3 text-black">Yes – delete your account</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Stripe customer token (paid users only)</td>
                      <td className="border border-black p-3 text-black">Random identifier from Stripe</td>
                      <td className="border border-black p-3 text-black">• Manage billing & receipts<br/>• Identify your subscription tier</td>
                      <td className="border border-black p-3 text-black">Yes – cancel plan & delete account</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-black mt-4">No other personal details (name, address, birth date, etc.) are required.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">4. How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li><strong>Provide the Service</strong> – create your account, send alerts, show your dashboard.</li>
                <li><strong>Customer support</strong> – reply to questions or troubleshoot problems.</li>
                <li><strong>Legal compliance</strong> – keep tax records or respond to lawful requests.</li>
              </ul>
              <p className="text-black mt-4">We do not use your info for ads, profiling, or data-brokering.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">5. Legal Bases for Processing (GDPR)</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-3 text-left text-black font-semibold">Purpose</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">Legal basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-3 text-black">Creating and running your account</td>
                      <td className="border border-black p-3 text-black">Contract – we need the data to deliver what you asked for.</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Email alerts</td>
                      <td className="border border-black p-3 text-black">Legitimate interest – alerts are the core product; they're expected.</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Marketing emails (e.g., new features)</td>
                      <td className="border border-black p-3 text-black">Consent – we'll only send these if you opt in.</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Fraud prevention & legal obligations</td>
                      <td className="border border-black p-3 text-black">Legal duty / legitimate interest</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">6. Cookies & Similar Tech</h2>
              <p className="text-black mb-4">We keep it simple:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-3 text-left text-black font-semibold">Cookie</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">Lifespan</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-3 text-black">Supabase auth tokens</td>
                      <td className="border border-black p-3 text-black">Until you log out or 7 days (whichever is sooner)</td>
                      <td className="border border-black p-3 text-black">Keeps you signed in securely</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Stripe checkout cookies</td>
                      <td className="border border-black p-3 text-black">As set by Stripe</td>
                      <td className="border border-black p-3 text-black">Needed for secure payment flow</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-black mt-4">No analytics or third-party ad cookies. You can block cookies in your browser, but the site may not work correctly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">7. Third-Party Service Providers</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-3 text-left text-black font-semibold">Provider</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">What they do</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">Data shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-3 text-black">Stripe</td>
                      <td className="border border-black p-3 text-black">Payment processing</td>
                      <td className="border border-black p-3 text-black">Email, subscription tier, payment token</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Google OAuth</td>
                      <td className="border border-black p-3 text-black">Optional password-free login</td>
                      <td className="border border-black p-3 text-black">Email address & OAuth ID</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-black mt-4">Each provider is vetted for security and privacy.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">8. Data Retention</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li><strong>Active accounts:</strong> we keep your data until you delete the account.</li>
                <li><strong>Deleted accounts:</strong> your email & tokens are wiped within 7 days; invoices required for tax stay for 7 years (U.S. law).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">9. Keeping Your Data Safe</h2>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li>HTTPS everywhere.</li>
                <li>Database & backups encrypted at rest.</li>
                <li>Access limited to the founder and automated deployment systems.</li>
                <li>Regular security patches and routine penetration tests.</li>
                <li>Incident-response plan: if a breach occurs, we'll notify affected users within 72 hours (GDPR standard).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">10. Your Rights</h2>
              <p className="text-black mb-4">Depending on where you live, you may have the right to:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-3 text-left text-black font-semibold">Right</th>
                      <th className="border border-black p-3 text-left text-black font-semibold">What it means</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-3 text-black">Access</td>
                      <td className="border border-black p-3 text-black">Ask what data we hold about you.</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Correction</td>
                      <td className="border border-black p-3 text-black">Fix inaccurate data.</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Deletion</td>
                      <td className="border border-black p-3 text-black">Delete your account ("right to be forgotten").</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Portability</td>
                      <td className="border border-black p-3 text-black">Get a copy of your data in CSV/JSON.</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Withdraw consent</td>
                      <td className="border border-black p-3 text-black">Opt out of marketing emails at any time.</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-3 text-black">Complain</td>
                      <td className="border border-black p-3 text-black">Contact your local data-protection authority.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-black mt-4">Email <a href="mailto:matcharestock@gmail.com" className="text-black underline">matcharestock@gmail.com</a> and we'll respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">11. Children's Privacy</h2>
              <p className="text-black">
                MatchaRestock is not directed to children under 13. We do not knowingly collect data from them. If you believe a child has provided personal info, email us; we'll delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">12. Changes to This Policy</h2>
              <p className="text-black mb-4">If we make material changes, we'll:</p>
              <ul className="list-disc list-inside space-y-2 text-black">
                <li>Post the new version here with a new "Last updated" date.</li>
                <li>Email all registered users before the change takes effect.</li>
              </ul>
              <p className="text-black mt-4">Continuing to use the Service after that means you accept the updated policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-black mb-4">13. Contact Us</h2>
              <p className="text-black">
                Questions or requests: <a href="mailto:matcharestock@gmail.com" className="text-black underline">matcharestock@gmail.com</a>
              </p>
              <p className="text-black mt-4">
                By using MatchaRestock, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
} 