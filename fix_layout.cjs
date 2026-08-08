const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Change grid-cols-1 md:grid-cols-2 to grid-cols-1 lg:grid-cols-2
code = code.replace(
  'className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"',
  'className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"'
);

// 2. Extract Calendly Widget
const calendlyStart = code.indexOf('{/* Real Calendly Embedded Widget */}');
const calendlyEnd = code.indexOf('</div>\n              </div>\n\n              {/* Right Column: Contact Form */}');
const calendlyWidget = code.substring(calendlyStart, calendlyEnd);

// 3. Remove Calendly Widget from left column
code = code.substring(0, calendlyStart) + code.substring(calendlyEnd);

// 4. Find end of Contact Form and insert Calendly Widget there (after the GlassCard)
const formEnd = code.indexOf('</GlassCard>\n            </motion.div>\n          )}');
const beforeFormEnd = code.substring(0, formEnd + 13); // +13 for </GlassCard>\n
const afterFormEnd = code.substring(formEnd + 13);

code = beforeFormEnd + '\n              </div>\n\n              {/* Right Column: Booking Widget */}\n              <div className="h-full">\n' + calendlyWidget.split('\n').map(l => '  ' + l).join('\n') + '\n              </div>\n' + afterFormEnd;

// Also change height from 600/550 to 700 to match Calendly script
code = code.replace('className="w-full h-[700px] rounded-2xl"', 'className="w-full flex-grow rounded-2xl"');
code = code.replace('height="700"', 'height="100%"');
code = code.replace('min-h-[700px]', 'min-h-[700px]');
// Make the outer panel flex flex-col to fill height
code = code.replace('border-white/10 space-y-4 relative overflow-hidden"', 'border-white/10 space-y-4 relative overflow-hidden h-full flex flex-col"');
// Make iframe wrapper flex-grow
code = code.replace('w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 min-h-[700px] shadow-inner', 'w-full flex-grow rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 min-h-[700px] shadow-inner flex flex-col mt-4');

// mt-auto for powered by text
code = code.replace('<p className="text-[10px] font-mono text-center text-slate-500">', '<p className="text-[10px] font-mono text-center text-slate-500 mt-auto pt-4">');

fs.writeFileSync('src/App.tsx', code);
