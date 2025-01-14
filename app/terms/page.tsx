export default function Terms() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 text-gray-800">Terms of Service</h1>
          
          <section className="prose prose-sm text-gray-600">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing and using ConvoAnalyzer, you agree to be bound by these Terms of Service.
            </p>

            <h3>Use of Service</h3>
            <ul>
              <li>You must be at least 13 years old to use this service</li>
              <li>You are responsible for any content you analyze using our service</li>
              <li>You agree not to misuse or attempt to abuse our service</li>
            </ul>

            <h3>Privacy & Data</h3>
            <ul>
              <li>All chat analysis is performed locally in your browser</li>
              <li>We collect anonymous usage statistics to improve our service</li>
              <li>We will never share your personal information with third parties</li>
            </ul>

            <h3>Limitations</h3>
            <p>
              We provide this service "as is" without any warranties. We reserve the right to:
            </p>
            <ul>
              <li>Modify or discontinue the service at any time</li>
              <li>Update these terms as needed</li>
              <li>Limit access to certain features</li>
            </ul>

            <h3>Contact</h3>
            <p>
              For questions about these terms, please contact{' '}
              <a href="mailto:support@convoanalyzer.com">support@convoanalyzer.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
} 