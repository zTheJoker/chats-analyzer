export default function Privacy() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 text-gray-800">Privacy Policy</h1>
          
          <section className="prose prose-sm text-gray-600">
            <h2>Your Data Privacy</h2>
            <p>
              At ConvoAnalyzer, we take your privacy seriously. Here's what you need to know about how we handle your data:
            </p>
            
            <h3>Chat Data Processing</h3>
            <ul>
              <li>All chat analysis is performed locally in your browser</li>
              <li>Your chat data never leaves your device</li>
              <li>We have zero access to your chat contents</li>
              <li>No chat data is stored on our servers</li>
            </ul>

            <h3>Analytics & Usage Data</h3>
            <p>
              We collect anonymous usage statistics to improve our service, including:
            </p>
            <ul>
              <li>Number of visits</li>
              <li>Pages viewed</li>
              <li>Time spent on site</li>
              <li>Browser type and device information</li>
            </ul>

            <h3>Future Features</h3>
            <p>
              For future features that may require data processing on our servers, we will:
            </p>
            <ul>
              <li>Always ask for explicit consent before processing any chat data</li>
              <li>Clearly explain how the data will be used</li>
              <li>Provide options to opt-out</li>
            </ul>

            <h3>Contact Us</h3>
            <p>
              If you have any questions about our privacy policy, please contact us at{' '}
              <a href="mailto:support@convoanalyzer.com">support@convoanalyzer.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
} 