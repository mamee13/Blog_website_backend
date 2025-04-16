export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About BlogSite</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            Welcome to BlogSite, a platform dedicated to sharing knowledge, ideas, and stories. Our mission is to create
            a space where writers can express themselves and readers can discover content that matters to them.
          </p>

          <h2>Our Story</h2>
          <p>
            BlogSite was founded in 2023 with a simple goal: to make publishing accessible to everyone. We believe that
            everyone has a story worth telling and knowledge worth sharing.
          </p>

          <h2>Our Values</h2>
          <ul>
            <li>
              <strong>Quality Content:</strong> We prioritize thoughtful, well-researched, and engaging content.
            </li>
            <li>
              <strong>Inclusivity:</strong> We welcome diverse perspectives and voices from all backgrounds.
            </li>
            <li>
              <strong>Community:</strong> We foster a supportive environment for writers and readers to connect.
            </li>
            <li>
              <strong>Accessibility:</strong> We strive to make our platform easy to use for everyone.
            </li>
          </ul>

          <h2>Join Our Community</h2>
          <p>
            Whether you're an experienced writer or just starting out, BlogSite is the perfect place to share your
            voice. Join our growing community of writers and readers today.
          </p>

          <h2>Contact Us</h2>
          <p>
            Have questions or feedback? We'd love to hear from you. Visit our
            <a href="/contact"> contact page</a> to get in touch with our team.
          </p>
        </div>
      </div>
    </div>
  )
}
