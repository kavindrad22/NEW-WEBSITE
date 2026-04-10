import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'index.html']

replacement = '''            <!-- Two Cousins Clean Transparent Wordmark -->
            <a href="index.html"
                class="flex flex-col justify-center pl-4 md:pl-12 h-[45px] md:h-[60px] opacity-0 animate-[wordmarkFadeIn_1.5s_ease-out_forwards] hover:scale-[1.03] transition-transform duration-500 origin-left group">
                <style>
                    @keyframes wordmarkFadeIn {
                        from { opacity: 0; transform: translateX(-15px); filter: blur(3px); }
                        to { opacity: 1; transform: translateX(0); filter: blur(0); }
                    }
                </style>
                <div class="flex items-baseline mb-0">
                    <span
                        class="font-heading font-bold italic tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none text-[22px] md:text-[30px] group-hover:text-gold transition-colors duration-500">
                        Two Cousins
                    </span>
                </div>
                <span
                    class="text-gray-300 text-[8px] md:text-[10px] tracking-[0.35em] uppercase mt-1 drop-shadow-md ml-1 font-sans">
                    Culinary Collections
                </span>
            </a>'''

pattern = re.compile(
    r'<a href="index\.html"[^>]*class="text-2xl font-heading font-bold text-white tracking-widest flex items-center gap-2 drop-shadow-md">\s*<span[^>]*class="text-gold">TAPROBANE</span>\s*LAGER\s*</a>',
    re.MULTILINE | re.DOTALL
)

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
