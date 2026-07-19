import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/" className="text-emerald-700 hover:text-emerald-600 font-medium text-sm">
        &larr; Back to Oyo Biz
      </Link>

      <h1 className="text-3xl font-bold text-stone-900 mt-6 mb-2">Privacy Policy</h1>
      <p className="text-stone-500 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-700">
        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">1. Who we are</h2>
          <p>
            Oyo Biz ("we", "us", "our") operates oyobiz.online, an online business directory
            connecting people with businesses across Oyo State, Nigeria. This policy explains
            what information we collect, how we use it, and the choices you have.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">2. Information we collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><span className="font-medium">Account information:</span> name, email address, and phone number when you sign up, either directly or via Google Sign-In.</li>
            <li><span className="font-medium">Business listing information:</span> business name, category, address, CAC registration number, contact details, and any documents or photos you upload when listing a business.</li>
            <li><span className="font-medium">Usage information:</span> pages visited, searches performed, and general interaction data to help us improve the directory.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">3. How we use Google account information</h2>
          <p>
            If you sign in with Google, we receive your name, email address, and profile
            picture from Google to create and secure your Oyo Biz account. We do not access
            your Google contacts, files, or any other Google data, and we never post to your
            Google account on your behalf.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">4. How we use your information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To create and manage your account</li>
            <li>To review and approve business listings</li>
            <li>To let other users search for and view approved business listings</li>
            <li>To communicate with you about your account or listing status</li>
            <li>To keep the platform secure and prevent abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">5. Sharing of information</h2>
          <p>
            Business listing details you submit (business name, category, city, address,
            phone, description, and photos) are shown publicly once approved, since the
            purpose of Oyo Biz is to help people discover businesses. We do not sell your
            personal information to third parties. We use Supabase to host our database and
            authentication, and may use standard analytics tools to understand how the site
            is used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">6. Data retention & your choices</h2>
          <p>
            You can request that we update or delete your account and associated business
            listings at any time by contacting us (see below). We retain information only as
            long as needed to provide the service or as required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">7. Contact us</h2>
          <p>
            Questions about this policy or your data? Reach us via the{' '}
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

export default PrivacyPolicy;
