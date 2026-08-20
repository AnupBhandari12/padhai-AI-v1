import './globals.css';

export const metadata = {
  title: 'PadhAI — Your AI Exam Tutor',
  description: 'Turn your study materials into a source-grounded AI tutor, quiz, mock test and revision workspace.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
