const operations = [
    { key: "+", effect: (a, b) => a + b },
    { key: "-", effect: (a, b) => a - b },
    { key: "*", effect: (a, b) => a * b },
    { key: "/", effect: (a, b) => a / b },
];

const keyEls = document.querySelectorAll(".key");
const keys = [...keyEls].map(keyEl => ({
    value: keyEl.dataset.key.toLowerCase(),
    element: keyEl,
}));
const display_input = document.querySelector(".display .input");
//const display_output=document.querySelector(".display .output");

let input = "";

window.addEventListener("keydown", (event) => {
    let keyCode = event.key.toLowerCase();
    switch (keyCode) {
        case "escape": keyCode = "clear"; break;
        case "enter": keyCode = "="; break;
        case "(":
        case ")": keyCode = "brackets"; break;
    }
    const key = keys.find(key => key.value === keyCode);
    if (key) {
        key.element.click();
    }
});

for (let keyEl of keyEls) {
    const value = keyEl.dataset.key;
    keyEl.addEventListener("click", () => {
        if (value === "clear") {
            input = "";
            display_input.innerHTML = "";
            //display_output.innerHTML="";
        }
        else if (value === "=") {
            let result = calculate(perpareInput(input));
            input = result.toString();
            display_input.innerHTML = input;
            //display_output.innerHTML=cleanOutput(result);
        }
        else {
            if (value === "backspace") {
                let count = input.endsWith("Infinity") ? -8 : -1;
                input = input.slice(0, count);
            }
            else if (value === "brackets") {
                if (
                    input.indexOf("(") == -1 ||
                    (input.indexOf("(") != -1 &&
                        input.indexOf(")") != -1 &&
                        input.lastIndexOf("(") < input.lastIndexOf(")"))
                ) {
                    input += "(";
                }
                else if (
                    (input.indexOf("(") != -1 && input.indexOf(")") == -1) ||
                    (input.indexOf("(") != -1 &&
                        input.indexOf(")") != -1 &&
                        input.lastIndexOf("(") > input.lastIndexOf(")"))
                ) {
                    input += ")";
                }
            }
            else if (value === ".") {
                const index = input.lastIndexOf(".");
                if (index < 0) {
                    input += ".";
                }
                else {
                    const opindex = Math.max(...operations.map(({ key }) => input.lastIndexOf(key)));
                    if (opindex > index) {
                        input += ".";
                    }
                }
            }
            else if (operations.some(({ key }) => key === value)) {
                const lastkey = operations.find(({ key }) => input.endsWith(key))?.key;
                //console.log(lastkey);
                if (lastkey) {
                    input = input.slice(0, -lastkey.length) + value;
                }
                else {
                    input += value;
                }
            }
            else if (validateInput(value)) {
                input += value;
            }
            display_input.innerHTML = cleanInput(input);
        }
    });
}

function cleanInput(input) {
    let input_array = input.split("");
    let input_array_length = input_array.length;

    for (let i = 0; i < input_array_length; i++) {
        if (input_array[i] === "*") {
            input_array[i] = ` <span class="operator">x</span> `;
        } else if (input_array[i] === "/") {
            input_array[i] = ` <span class="operator">÷</span> `;
        } else if (input_array[i] === "+") {
            input_array[i] = ` <span class="operator">+</span> `;
        } else if (input_array[i] === "-") {
            input_array[i] = ` <span class="operator">-</span> `;
        } else if (input_array[i] === "(") {
            input_array[i] = `<span class="brackets">(</span>`;
        } else if (input_array[i] === ")") {
            input_array[i] = `<span class="brackets">)</span>`;
        } else if (input_array[i] === "%") {
            input_array[i] = `<span class="percent">%</span>`;
        }
    }

    return input_array.join("");
}

function cleanOutput(output) {
    let output_string = output.toString();
    let decimal = output_string.split(".")[1];
    output_string = output_string.split(".")[0];

    let output_array = output_string.split("");

    if (output_array.length > 3) {
        for (let i = output_array.length - 3; i > 0; i -= 3) {
            output_array.splice(i, 0, ",");
        }
    }

    if (decimal) {
        output_array.push(".");
        output_array.push(decimal);
    }

    return output_array.join("");
}

function validateInput(value) {
    let last_input = input.slice(-1);
    const opkeys = operations.map(({ key }) => key);
    if (value === "." && last_input === ".") {
        return false;
    }

    if (opkeys.includes(value)) {
        if (opkeys.includes(last_input)) {
            return false;
        } else {
            return true;
        }
    }

    return true;
}

function perpareInput(input = "") {
    input = input.replace(/ /g, "");
    let input_array = input.split("");

    for (let i = 0; i < input_array.length; i++) {
        if (input_array[i] === "%") {
            input_array[i] = "/100";
        }
    }

    return input_array.join("");
}

function calculate(expression = "") {
    let result;
    if (expression) {
        const regex = /\(|\)/g;
        const hasParenthesis = expression.search(regex);
        if (hasParenthesis > -1) {
            const expressions = expression.split(regex);
            const results = expressions.map(calculate);
            result = results.reduce((a, sum) => a + sum, 0);
        }
        else {
            let opindex = expression.search(/\+|-/);
            if (opindex < 0) { opindex = expression.search(/\/|\*/) };
            if (opindex < 0) {
                result = parseFloat(expression);
            }
            else {
                const expkey = expression[opindex];
                const leftexp = expression.substring(0, opindex);
                const rightexp = expression.substring(opindex + 1);
                const operation = operations.find(({ key }) => key === expkey);
                result = operation.effect(calculate(leftexp), calculate(rightexp));
            }
        }
    }
    else {
        result = 0;
    }
    return parseFloat(result.toFixed(5));
}