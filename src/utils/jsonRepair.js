/**
 * Tries to repair a truncated JSON string by closing open brackets and braces.
 * @param {string} jsonString - The potentially truncated JSON string.
 * @return {string} - The repaired JSON string.
 */
export function jsonRepair(jsonString) {
    let repaired = jsonString.trim();

    // Basic cleanup: remove trailing commas before closing brackets
    // This is a simple heuristic and might not catch all cases

    const stack = [];
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];

        if (isEscaped) {
            isEscaped = false;
            continue;
        }

        if (char === '\\') {
            isEscaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{' || char === '[') {
                stack.push(char);
            } else if (char === '}') {
                if (stack.length > 0 && stack[stack.length - 1] === '{') {
                    stack.pop();
                }
            } else if (char === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === '[') {
                    stack.pop();
                }
            }
        }
    }

    // If we are still in a string, close it
    if (inString) {
        repaired += '"';
    }

    // Close remaining open structures in reverse order
    while (stack.length > 0) {
        const open = stack.pop();
        if (open === '{') {
            repaired += '}';
        } else if (open === '[') {
            repaired += ']';
        }
    }

    return repaired;
}
