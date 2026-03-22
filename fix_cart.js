const fs = require('fs');
const path = 'c:\\final year\\src\\pages\\Cart.jsx';
let content = fs.readFileSync(path, 'utf8');

// The problematic section is around line 329.
// We are missing a closing div for payment-header-card.
// We will search for the payment-icons div closing and the cashback-banner closing.

const searchStr = '                          </div>\n                       </div>\n                                        <div className="payment-options-list">';
// Since matching exact spaces failed, let's use a regex.
const regex = /<\/div>\s+<\/div>\s+<div className="payment-options-list">/;
const replacement = '</div>\n                       </div>\n                    </div>\n\n                    <div className="payment-options-list">';

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed the file.');
} else {
    console.log('Could not find the target section with regex.');
    // Let's try matching a smaller part
    const regex2 = /<div className="payment-icons">[\s\S]*?<\/div>\s+<\/div>\s+<div className="payment-options-list">/;
    if (regex2.test(content)) {
        content = content.replace(regex2, (match) => {
             // We want to insert </div> before <div className="payment-options-list">
             return match.replace('<div className="payment-options-list">', '</div>\n\n                    <div className="payment-options-list">');
        });
        fs.writeFileSync(path, content);
        console.log('Successfully fixed the file with regex2.');
    } else {
        console.log('Regex2 also failed.');
        // Last resort: find payment-options-list and insert </div> before it if it's not preceded by enough </div>s
        // But let's first check what's actually there.
        console.log('DEBUG: ' + content.substring(content.indexOf('payment-icons') - 50, content.indexOf('payment-options-list') + 50));
    }
}
