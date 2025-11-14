// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default function Feature(props: {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}) {
    return (
        <div className={`reveal-on-scroll card ${props.className}`}>
            <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg"
                style={{
                    background: 'rgba(96, 165, 250, 0.1)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                }}
            >
                {props.icon}
            </div>
            <h3 className="mb-3 text-xl font-bold">{props.title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{props.description}</p>
        </div>
    );
}
