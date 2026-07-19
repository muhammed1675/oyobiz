import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/" className="text-emerald-700 hover:text-emerald-600 font-medium text-sm">
        &larr; Back to Oyo Biz
      </Link>

      <h1 className="text-3xl font-bold text-stone-900 mt-6 mb-2">Terms of Service</h1>
      <p className="text-stone-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-700">
        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">1. Acceptance of terms</h2>
          <p>
            By creating an account or using oyobiz.online ("Oyo Biz", "the platform"), you
            agree to these Terms of Service. If you do not agree, please do not use the
            platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">2. What Oyo Biz is</h2>
          <p>
            Oyo Biz is an online directory that helps people discover businesses in Oyo
            State, Nigeria, and helps business owners list and promote their businesses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">3. Accounts</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must provide accurate information when creating an account or listing a business.</li>
            <li>You are responsible for keeping your account credentials secure.</li>
            <li>You must be legally able to represent any business you list.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">4. Business listings</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Submitted business listings are reviewed by our team before being published (status: pending, approved, or rejected).</li>
            <li>We may reject or remove listings that are fraudulent, inaccurate, or violate these terms — for example, an invalid or unverifiable CAC registration number.</li>
            <li>You are responsible for keeping your business listing information accurate and up to date.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Submit false, misleading, or fraudulent business information</li>
            <li>Impersonate another person or business</li>
            <li>Attempt to disrupt or gain unauthorized access to the platform</li>
            <li>Use the platform to send spam or unsolicited communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">6. Reviews</h2>
          <p>
            Users may leave reviews and ratings for approved businesses. Reviews must be
            honest and based on genuine experience. We may remove reviews that are abusive,
            fake, or violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">7. Disclaimer</h2>
          <p>
            Oyo Biz provides a directory service only. We do not guarantee the accuracy of
            listings, and we are not a party to any transaction between users and listed
            businesses. Use of the platform and any business you contact through it is at
            your own discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">8. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the platform after
            changes means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">9. Contact us</h2>
          <p>
            Questions about these terms? Reach us via the{' '}
            <Link to="/contact-admin" className="text-emerald-700 hover:text-emerald-600 font-medium">
              Contact Admin
            </Link>{' '}
            page.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
