"use server";
// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default async function submitForm(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    // Here you would typically handle the form submission,
    // such as sending an email or storing the message in a database.
    console.log('Form submitted:', { name, email, message });
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate async operation
    // For demonstration purposes, we'll just return a success message.
    return;
}