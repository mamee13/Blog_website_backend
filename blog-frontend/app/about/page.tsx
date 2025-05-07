import { Briefcase } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary mb-4 font-sans">
              About Me
            </h1>
          </div>

          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl transform"></div>
            <div className="relative p-8 rounded-2xl">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-md"></div>
                  <div className="rounded-full overflow-hidden w-48 h-48 shadow-xl relative">
                    <img
                      src="/images/profile.jpg"
                      alt="Mamaru Yirga"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Mamaru Yirga</h2>
                <p className="text-xl text-muted-foreground">Full-Stack Developer</p>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
                  Hello! I'm Mamaru Yirga, a passionate full-stack web and mobile app developer 
                  dedicated to creating intuitive and efficient digital experiences. I specialize 
                  in building robust applications using modern technologies and best practices.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl -rotate-3 transform"></div>
              <section className="bg-card rounded-xl p-8 shadow-sm relative">
                <h2 className="text-2xl font-bold mb-6">Technical Expertise</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors">
                    <h3 className="font-semibold mb-4">Frontend</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>React.js</li>
                      <li>Next.js</li>
                      <li>TypeScript</li>
                      <li>Tailwind CSS</li>
                    </ul>
                  </div>
                  <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors">
                    <h3 className="font-semibold mb-4">Backend</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Node.js</li>
                      <li>Express.js</li>
                      <li>MongoDB</li>
                      <li>RESTful APIs</li>
                    </ul>
                  </div>
                  <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors">
                    <h3 className="font-semibold mb-4">Tools & Others</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>Git</li>
                      <li>Docker</li>
                      <li>AWS</li>
                      <li>Agile Methods</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl rotate-2 transform"></div>
              <section className="bg-card rounded-xl p-8 shadow-sm relative">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" />
                    What I can work on
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors">
                      <h3 className="font-semibold mb-2">Full-stack Web Applications</h3>
                      <p className="text-muted-foreground">End-to-end solutions for your digital needs</p>
                    </div>
                    <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors">
                      <h3 className="font-semibold mb-2">Mobile App Development</h3>
                      <p className="text-muted-foreground">Native and cross-platform mobile solutions</p>
                    </div>
                    <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors">
                      <h3 className="font-semibold mb-2">API Development & Integration</h3>
                      <p className="text-muted-foreground">Robust and scalable API solutions</p>
                    </div>
                    <div className="p-6 border rounded-xl hover:border-primary/50 transition-colors">
                      <h3 className="font-semibold mb-2">Technical Consultation</h3>
                      <p className="text-muted-foreground">Expert guidance for your projects</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">Let's Work Together</h2>
            <p className="mb-6 text-muted-foreground">
              I'm always interested in hearing about new projects and opportunities.
              Let's create something amazing together!
            </p>
            <div className="flex justify-center">
              <a
                href="/contact"
                className="bg-gradient-to-r from-primary to-primary text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity text-lg font-medium"
              >
                Contact Me
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
