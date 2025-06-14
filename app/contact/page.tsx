//app/api/contact/page.tsx
'use client';

import { motion } from 'framer-motion';

export default function ContactPage() {
    return (
        <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-20 flex items-center justify-center">
            <motion.div
                className="w-full max-w-3xl bg-white/5 backdrop-blur-sm p-10 rounded-2xl shadow-xl"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                {/* العنوان والوصف */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-white">Contact Us</h1>
                    <p className="text-gray-300 mt-2">We’d love to hear from you. Fill out the form below.</p>
                </div>

                {/* النموذج */}
                <form className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Your name"
                            className="mt-1 block w-full rounded-lg bg-white/10 text-white border border-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            className="mt-1 block w-full rounded-lg bg-white/10 text-white border border-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                        <textarea
                            id="message"
                            rows={4}
                            placeholder="Write your message..."
                            className="mt-1 block w-full rounded-lg bg-white/10 text-white border border-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="text-center">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                        >
                            Send Message
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </section>
    );
}
