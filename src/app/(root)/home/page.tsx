"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface User {
  email?: string
  id: string
  name?: string
}

type HomePageProps = {
  user: User | null
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function HomePage({ user }: HomePageProps) {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div
          className="text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h1 className="text-6xl lg:text-7xl font-bold text-black mb-6" variants={fadeInUp}>
            Clarity
            <span
              className="text-white font-bold mx-2 hover:scale-110 transition-transform duration-300 inline-block cursor-default"
              style={{ WebkitTextStroke: "2px black" }}
            >
              X
            </span>
          </motion.h1>
          <motion.h2
            className="text-4xl lg:text-5xl font-normal text-gray-500 mb-12 max-w-4xl mx-auto leading-tight"
            variants={fadeInUp}
          >
            X is the unknown, we provide clarity on the unknown
          </motion.h2>
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform cursor-pointer">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform cursor-pointer">
                      Get Started
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-full px-12 py-4 text-xl font-semibold transition-all duration-300 hover:scale-105 transform bg-transparent cursor-pointer hover:shadow-md"
                  >
                    View Demo
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Voice-Driven Understanding Section */}
      <section id="features" className="min-h-screen flex items-center px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeInLeft}>
              <h3 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
                Voice-driven understanding.
              </h3>
              <p className="text-xl text-gray-500 leading-relaxed">
                Speak naturally while coding. ClarityX listens to your thought process and automatically visualizes your
                conceptual understanding in real-time.
              </p>
            </motion.div>
            <motion.div
              className="relative w-full h-80 lg:h-96 group cursor-pointer"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInRight}
            >
              <Image
                src="/developer-speaking-into-microphone-with-code-visua.jpg"
                alt="Developer using voice interface with real-time code understanding visualization"
                fill
                className="rounded-lg object-cover transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Real-Time Visualization Section */}
      <section className="min-h-screen flex items-center px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="relative w-full h-80 lg:h-96 order-2 lg:order-1 group cursor-pointer"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <Image
                src="/dynamic-concept-map-showing-code-understanding-wit.jpg"
                alt="Real-time concept mapping showing understanding gaps and connections"
                fill
                className="rounded-lg object-cover transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
            <motion.div
              className="order-1 lg:order-2"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInRight}
            >
              <h3 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">Real-time visualization.</h3>
              <p className="text-xl text-gray-500 leading-relaxed">
                Watch your understanding evolve live. ClarityX automatically selects the best visualization for your
                conceptual structure and learning patterns.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="min-h-screen flex items-center px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            className="grid md:grid-cols-3 gap-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="group cursor-pointer">
              <div className="relative w-full h-64 mb-6 overflow-hidden rounded-lg">
                <Image
                  src="/voice-interface-with-sound-waves-and-microphone-ic.jpg"
                  alt="Voice-first interface illustration"
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h4 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors duration-300">
                Voice-first interface.
              </h4>
              <p className="text-lg text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                No complex UI to learn. Just speak naturally while you code and let ClarityX understand your thinking.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="group cursor-pointer">
              <div className="relative w-full h-64 mb-6 overflow-hidden rounded-lg">
                <Image
                  src="/concept-map-with-connected-nodes-showing-knowledge.jpg"
                  alt="Concept mapping illustration"
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h4 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors duration-300">
                Targets the unknown.
              </h4>
              <p className="text-lg text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                Identifies true knowledge gaps—not random errors—and visualizes exactly where your understanding breaks
                down.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="group cursor-pointer">
              <div className="relative w-full h-64 mb-6 overflow-hidden rounded-lg">
                <Image
                  src="/automatic-chart-selection-with-different-visualiza.jpg"
                  alt="Auto visualization illustration"
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h4 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors duration-300">
                Auto visualization.
              </h4>
              <p className="text-lg text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                Intelligent chart selection based on your understanding patterns. The right visualization,
                automatically.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* See ClarityX in Action Section */}
      <section id="demo" className="min-h-screen flex items-center px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center w-full"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h3 className="text-4xl lg:text-5xl font-bold text-black mb-6" variants={fadeInUp}>
            See ClarityX in Action
          </motion.h3>
          <motion.p className="text-xl text-gray-500 leading-relaxed mb-12" variants={fadeInUp}>
            Transform how you understand code. Our voice-driven AI visualizes your thinking and reveals the unknown.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-full px-10 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 transform bg-transparent cursor-pointer hover:shadow-md"
              >
                View Demo
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center px-6 lg:px-8 bg-gray-50">
        <motion.div
          className="max-w-2xl mx-auto w-full"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h3 className="text-4xl lg:text-5xl font-bold text-black mb-6">Get in Touch</h3>
            <p className="text-xl text-gray-500 leading-relaxed">
              Ready to transform how you understand code? Let&apos;s talk about ClarityX.
            </p>
          </motion.div>

          <motion.form className="space-y-6" variants={fadeInUp}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 cursor-text"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 cursor-text"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 cursor-text"
                placeholder="What would you like to discuss?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white resize-none hover:border-gray-400 cursor-text"
                placeholder="Tell us about your project or questions..."
              />
            </div>

            <div className="text-center">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800 rounded-full px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform cursor-pointer"
              >
                Send Message
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="bg-white py-24 px-6 lg:px-8 border-t border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-5 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-xl font-bold text-black">
                  Clarity
                  <span
                    className="text-white font-bold mx-1 hover:scale-110 transition-transform duration-300 inline-block cursor-default"
                    style={{ WebkitTextStroke: "1px black" }}
                  >
                    X
                  </span>
                </span>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h5 className="font-bold text-black mb-4">Product</h5>
              <ul className="space-y-3 text-gray-500">
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Voice Interface
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Visualization
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Get Started
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h5 className="font-bold text-black mb-4">Platform</h5>
              <ul className="space-y-3 text-gray-500">
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    For Developers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    For Students
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Integrations
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h5 className="font-bold text-black mb-4">Company</h5>
              <ul className="space-y-3 text-gray-500">
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Blog
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h5 className="font-bold text-black mb-4">Support</h5>
              <ul className="space-y-3 text-gray-500">
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors duration-300 cursor-pointer">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </motion.div>
          </motion.div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500">© 2025 ClarityX. X is the unknown, we provide clarity on the unknown.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}