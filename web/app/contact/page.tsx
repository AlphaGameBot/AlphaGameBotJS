"use client";
// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState } from "react";
import submitForm from "./submitForm";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-3xl">
                <section className="container py-12">
                    <h1 className="mb-6 text-4xl font-bold">Contact Us</h1>
                    <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                        We&apos;d love to hear from you! Whether you have questions, feedback, or need support, feel free to reach out.
                    </p>
                    {submitted ? (
                        <div
                            className="p-6 border border-blue-500 rounded-md flex items-start gap-4"
                            aria-live="polite"
                        >
                            <div className="shrink-0">
                                <svg
                                    className="h-8 w-8 text-green-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-30" />
                                    <path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold mb-1">Got it! Thanks!</h2>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    I just got your message, and I&apos;ll get back to you as soon as possible.
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary px-4 h-10"
                                        onClick={() => {
                                            setIsSubmitting(false);
                                            setSubmitted(false);
                                        }}
                                    >
                                        Send another message
                                    </button>

                                    <a
                                        href="mailto:howdy@alphagamebot.com"
                                        className="text-sm"
                                        style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}
                                    >
                                        Or email us directly
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form
                            className="space-y-6"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget as HTMLFormElement;
                                const formData = new FormData(form);

                                setIsSubmitting(true);
                                try {
                                    await submitForm(formData);
                                    setSubmitted(true);
                                    form.reset();
                                } catch (err) {
                                    console.error("Form submit failed:", err);
                                    setError(err instanceof Error ? err.message : String(err));
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                        >
                            <div>
                                <label htmlFor="name" className="block mb-2 font-medium">Name</label>
                                <input type="text" id="name" name="name" className="w-full p-3 border border-gray-300 rounded" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 font-medium">Email</label>
                                <input type="email" id="email" name="email" className="w-full p-3 border border-gray-300 rounded" required />
                            </div>
                            <div>
                                <label htmlFor="message" className="block mb-2 font-medium">Message</label>
                                <textarea id="message" name="message" rows={5} className="w-full p-3 border border-gray-300 rounded" required></textarea>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="h-12 flex items-center" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    I&apos;ll get back to you as soon as possible!
                                </div>
                                <button type="submit" className="btn btn-primary px-6 h-12">
                                    {isSubmitting && (
                                        <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                    )}
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                            {error && (
                                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                                    {error}
                                </div>
                            )}
                        </form>
                    )}
                </section>
                <h2 className="mt-12 text-2xl font-bold px-6 md:px-0">Alternate Contact Methods</h2>
                <p className="mb-4 px-6 md:px-0" style={{ color: 'var(--text-muted)' }}>
                    If webforms aren&apos;t your thing, you can also reach me via email at{" "}
                    <a href="mailto:howdy@alphagamebot.com" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                        howdy@alphagamebot.com
                    </a>!
                </p>
            </div>
        </div>
    );
}