import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://alphagamebot.com"),
    title: {
        default: "AlphaGameBot - Free Discord Leveling Bot | Boost Server Engagement",
        template: "%s • AlphaGameBot",
    },
    description:
    "Free open-source Discord bot with user leveling, XP system, global leaderboards, and engagement tracking. Boost your Discord community with 1,200+ active servers.",
    keywords: [
        "discord bot",
        "leveling bot",
        "discord xp",
        "server engagement",
        "discord leaderboard",
        "free discord bot",
        "open source discord bot",
        "discord community",
        "discord gamification",
    ],
    authors: [{ name: "Damien Boisvert" }],
    creator: "Damien Boisvert",
    publisher: "AlphaGameBot",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://alphagamebot.com",
        title: "AlphaGameBot - Free Discord Engagement Bot",
        description:
      "Boost your Discord server engagement with our free open-source leveling bot. XP system, global leaderboards, and more!",
        siteName: "AlphaGameBot",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "AlphaGameBot Discord Bot",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AlphaGameBot - Free Discord Engagement Bot",
        description:
      "Boost your Discord server engagement with our free open-source leveling bot. XP system, global leaderboards, and more!",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://alphagamebot.com",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en" >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className="bg-gray-900 text-gray-200 font-sans antialiased min-h-screen flex flex-col justify-between  " >
                {children}
            </body>
        </html>
    );
}
