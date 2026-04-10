import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]

# The exact old snippet to match (we will use regex to be safe against whitespace)
pattern = re.compile(
    r'<!-- Two Cousins Clean Transparent Wordmark -->\s*<a href="index\.html"[^>]*class="flex flex-col justify-center pl-4 md:pl-12 h-\[45px\] md:h-\[60px\] opacity-0 animate-\[wordmarkFadeIn_1\.5s_ease-out_forwards\] hover:scale-\[1\.03\] transition-transform duration-500 origin-left group">.*?Culinary Collections\s*</span>\s*</a>',
    re.MULTILINE | re.DOTALL
)

replacement = '''            <!-- Two Cousins Image Logo -->
            <a href="index.html"
                class="flex relative items-center justify-center pl-2 md:pl-6 opacity-0 animate-[wordmarkFadeIn_1.5s_ease-out_forwards] hover:scale-[1.05] transition-transform duration-500 origin-left group">
                <style>
                    @keyframes wordmarkFadeIn {
                        from { opacity: 0; transform: translateX(-15px); filter: blur(3px); }
                        to { opacity: 1; transform: translateX(0); filter: blur(0); }
                    }
                </style>
                <img src="static/images/two_cousins_badge.jpg" alt="Two Cousins Logo" class="h-[60px] md:h-[90px] w-auto object-contain mix-blend-screen invert grayscale brightness-[2.0] transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:brightness-[1.5] group-hover:sepia group-hover:saturate-[5] group-hover:-hue-rotate-15">
            </a>'''

for filename in files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if pattern.search(content):
        new_content = pattern.sub(replacement, content)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"Pattern not found in {filename}")
