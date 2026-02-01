// src/components/layout/Footer.tsx
export default function Footer({ className = "" }) {
  return (
    <footer className={`w-full border-t bg-gray-50 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 py-4 h-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Joyfive. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="https://github.com" target="_blank" className="hover:text-black">Github</a>
            <a href="mailto:admin@example.com" className="hover:text-black">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}