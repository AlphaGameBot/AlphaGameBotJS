// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Metadata } from "next";
import AboutPage from "./AboutPage";


export const metadata: Metadata = {
    title: "About"
};

export default function AboutServerPage() {
    return (
        <AboutPage />
    );
}