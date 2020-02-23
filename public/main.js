
//import './main.css'
//console.log((x >>> 0).toString(2))



//PARSER    

//console.log("a\nb\r\nc".split(/\r?\n/))

//var codeMirror = require('codemirror')





var textArea = document.getElementById("ide")
var submit = document.getElementById("submit")
var memory = []
var instructions = []
var wordAddresses = []
let nextButtonClicked = false


var myCodeMirror = CodeMirror.fromTextArea(textArea, {
    value: "Enter Code Here",
    lineNumbers: true,
    theme: "blackboard",

});
for (let i = 0; (i < 1024 * 8); i++) {
    memory.push(0);
}
// console.log(memory)

//For changing tabs
$('.menu .item')
    .tab()
    ;

//Code For Uploading a file
document.getElementById('input_file')
    .addEventListener('change', getFile)

function getFile(event) {
    const input = event.target
    if ('files' in input && input.files.length > 0) {
        placeFileContent(
            input.files[0])
    }
}

function placeFileContent(file) {
    readFileContent(file).then(content => {
        myCodeMirror.setValue(content)
    }).catch(error => console.log(error))
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}

//===============================================================


var registers = new Map(
    [
        ["r0", 0],
        ["at", 0],
        ["v0", 0],
        ["v1", 0],
        ["a0", 0],
        ["a1", 0],
        ["a2", 0],
        ["a3", 0],
        ["t0", 0],
        ["t1", 0],
        ["t2", 0],
        ["t3", 0],
        ["t4", 0],
        ["t5", 0],
        ["t6", 0],
        ["t7", 0],
        ["s0", 0],
        ["s1", 0],
        ["s2", 0],
        ["s3", 0],
        ["s4", 0],
        ["s5", 0],
        ["s6", 0],
        ["s7", 0],
        ["t8", 0],
        ["t9", 0],
        ["k0", 0],
        ["k1", 0],
        ["gp", 0],
        ["sp", 0],
        ["s8", 0],
        ["ra", 0]]
)
//console.log(registers)


function displayRegisters() {
    let divReg = document.querySelector('.registerDiv')
    divReg.innerHTML = ''
    let i = 1
    console.log(registers)
    registers.forEach((value, key) => {
        let h3text = ` "${key}" : ${(value >>> 0).toString(2)}`
        let h3 = document.createElement('h4')
        h3.classList.add("item")
        h3.textContent = h3text
        divReg.appendChild(h3)
        i += 1

    })
    console.log(divReg.innerHTML)
}
displayRegisters()


function add(ins) {
    console.log(ins)
    let rd = ins[1][1] + ins[1][2]
    let r1 = ins[2][1] + ins[2][2]
    let r2 = ins[3][1] + ins[3][2]
    let operand1 = registers.get(r1)
    let operand2 = registers.get(r2)
    let sum = operand1 + operand2
    registers = registers.set(rd, sum)
    // console.log(registers)
    displayRegisters()
}

function addi(ins) {
    console.log(ins)
    let rd = ins[1][1] + ins[1][2]
    let r1 = ins[2][1] + ins[2][2]
    let decimal = ''
    if (ins[3].slice(0, 2) == "0x")
        decimal = parseInt(ins[3], 16)
    else
        decimal = parseInt(ins[3])

    if (decimal > Math.pow(2, 16))
        console.log("Instruction size is greater than 32 bits")
    let operand1 = registers.get(r1)
    let sum = operand1 + decimal
    registers = registers.set(rd, sum)
    // console.log(registers)
    displayRegisters()
}

function sll(ins) {
    console.log(ins)
    let rd = ins[1][1] + ins[1][2]
    let r1 = ins[2][1] + ins[2][2]
    let decimal = ''
    if (ins[3].slice(0, 2) == "0x")
        decimal = parseInt(ins[3], 16)
    else
        decimal = parseInt(ins[3])
    if (decimal > Math.pow(2, 16))
        console.log("Instruction size is greater than 32 bits")
    let operand1 = registers.get(r1)
    let shiftedNum = operand1 << parseInt(decimal)
    console.log(operand1, parseInt(decimal))
    registers = registers.set(rd, shiftedNum)
    // console.log(registers)
    displayRegisters()
}

function sub(ins) {
    let rd = ins[1][1] + ins[1][2]
    let r1 = ins[2][1] + ins[2][2]
    let r2 = ins[3][1] + ins[3][2]
    let operand1 = registers.get(r1)
    let operand2 = registers.get(r2)
    let diff = operand1 - operand2
    registers = registers.set(rd, diff)
    displayRegisters()
}
function slt(ins) {
    console.log(ins)
    let rd = ins[1][1] + ins[1][2]
    let r1 = ins[2][1] + ins[2][2]
    let r2 = ins[3][1] + ins[3][2]
    let operand1 = registers.get(r1)
    let operand2 = registers.get(r2)
    console.log(operand1, operand2)
    if (operand1 < operand2) {
        registers = registers.set(rd, 1)
        console.log(rd)
    }
    else
        registers = registers.set(rd, 0)

    displayRegisters()
}


function lw(ins) {
    console.log(ins)
    let rd = ins[1][1] + ins[1][2]
    let offsetRegister = ins[2].split("\(")
    console.log(offsetRegister)
    let rs = offsetRegister[1].split(')')[0]
    let finalAddress = registers.get(rs[1] + rs[2]) + offsetRegister[0] * 4
    console.log(finalAddress)
    console.log(memory)
    let BinaryEquivalent = ""
    BinaryEquivalent = memory[finalAddress - 1] + memory[finalAddress] + memory[finalAddress + 1] + memory[finalAddress + 2]
    console.log(BinaryEquivalent)
    //console.log(parseInt(BinaryEquivalent.slice(1, 32), 2), Math.pow(2 * parseInt(BinaryEquivalent[0]), 31))
    decimalValue = parseInt(BinaryEquivalent.slice(1, 32), 2) - Math.pow(2 * parseInt(BinaryEquivalent[0]), 31)// Using 2s complement property
    //console.log(decimalValue)
    registers.set(rd, decimalValue)
    displayRegisters()
    // let r1 = ins[2][1] + ins[2][2]
}

function sw(ins, memoryIndex) {
    console.log(ins)
    let rd = ins[1][1] + ins[1][2]
    let offsetRegister = ins[2].split("\(")
    console.log(offsetRegister)
    let rs = offsetRegister[1].split(')')[0]
    let finalAddress = registers.get(rs[1] + rs[2]) + offsetRegister[0] * 4
    console.log(finalAddress)
    let numberToBeStored = registers.get(rd)
    let BinaryEquivalent = (numberToBeStored >>> 0).toString(2)

    let initialLength = BinaryEquivalent.length
    for (let j = 0; j < (32 - initialLength); j += 1) {
        BinaryEquivalent = "0" + BinaryEquivalent;
    }

    memory[finalAddress - 1] = BinaryEquivalent.slice(0, 8)
    memory[finalAddress] = BinaryEquivalent.slice(8, 16)
    memory[finalAddress + 1] = BinaryEquivalent.slice(16, 24)
    memory[finalAddress + 2] = BinaryEquivalent.slice(24, 32)
    console.log(memory)
    if (finalAddress >= memoryIndex) {
        wordAddresses.push(finalAddress)
        console.log(finalAddress)
    }
    displayMemory(memoryIndex)//I have to change this
    //displayRegisters()
    // let r1 = ins[2][1] + ins[2][2]
}

function beq(ins, pc, jumpPositions) {
    let r1 = ins[1][1] + ins[1][2]
    let r2 = ins[2][1] + ins[2][2]

    let r1Value = registers.get(r1)
    let r2Value = registers.get(r2)
    if (r1Value == r2Value) {
        return jumpPositions.get(ins[3])
    } else {
        return pc
    }
}

function jump(ins, jumpPositions) {
    return jumpPositions.get(ins[1])
}

function displayMemory(memoryIndex) {
    console.log(memoryIndex)
    let memDiv = document.querySelector(".memoryDiv")
    memDiv.innerHTML = ""
    for (let i = 0; i < memoryIndex; i += 4) {
        let span = document.createElement('span')
        span.classList.add("item")
        span.innerText = "\n[0x" + (i + 1).toString(16) + "]: " + memory[i] + " " + memory[i + 1] + " " + memory[i + 2] + " " + memory[i + 3] + "  "
        memDiv.appendChild(span)
    }
    console.log(wordAddresses)
    for (let i = 0; i < wordAddresses.length; i++) {

        let span = document.createElement('span')
        span.classList.add("item")
        span.innerText = "\n[0x" + (wordAddresses[i]).toString(16) + "]: " + memory[wordAddresses[i] - 1] + "  " + memory[wordAddresses[i]] + " " + memory[wordAddresses[i] + 1] + " " + memory[wordAddresses[i] + 2] + " "
        memDiv.appendChild(span)
    }

}

submit.onclick = () => {
    if (!nextButtonClicked) {

        memoryIndex = 0

        splitted = []


        myCodeMirror.getDoc().children.forEach((child) => {
            child.lines.forEach((ins) => {
                ins = ins.text.trim()
                splitted.push(ins.split(/[ ,.]+/))
            })
        })

        let jumpPositions = new Map()
        console.log(splitted)

        for (let j = 0; j < splitted.length; j++) {
            if (splitted[j][0][(splitted[j][0].length) - 1] == ':') {
                jumpPositions.set((splitted[j][0].slice(0, splitted[j][0].length - 1)), j)
            }
        }
        console.log(jumpPositions)

        let arrayAddresses = new Map();//even for strings


        for (let i = 1; i > 0; i++) {
            if (splitted[i][1] == "text")
                break;
            else if (splitted[i][1] == "word") {
                if (splitted[i].length != 3)
                    arrayAddresses.set(splitted[i - 1][0].split(":")[0], memoryIndex)
                for (let j = 2; j < splitted[i].length; j++) {
                    let numberToBeStored = parseInt(splitted[i][j])
                    let BinaryEquivalent = (numberToBeStored >>> 0).toString(2)

                    let initialLength = BinaryEquivalent.length
                    for (let j = 0; j < (32 - initialLength); j += 1) {
                        BinaryEquivalent = "0" + BinaryEquivalent;
                    }

                    memory[memoryIndex] = BinaryEquivalent.slice(0, 8)
                    memory[memoryIndex + 1] = BinaryEquivalent.slice(8, 16)
                    memory[memoryIndex + 2] = BinaryEquivalent.slice(16, 24)
                    memory[memoryIndex + 3] = BinaryEquivalent.slice(24, 32)
                    memoryIndex += 4;
                }
            }

        }

        displayMemory(memoryIndex)



        for (let i = 0; i < splitted.length; i++) {
            console.log(registers.get("s3"))
            console.log(splitted[i])
            if (splitted[i][0] == "add")
                add(splitted[i])
            else if (splitted[i][0] == "sub")
                sub(splitted[i])
            else if (splitted[i][0] == "lw")
                lw(splitted[i])
            else if (splitted[i][0] == "sw")
                sw(splitted[i], memoryIndex)
            else if (splitted[i][0] == "beq")
                i = beq(splitted[i], i, jumpPositions)
            else if (splitted[i][0] == "j")
                i = jump(splitted[i], jumpPositions)
            else if (splitted[i][0] == "addi")
                addi(splitted[i])
            else if (splitted[i][0] == "slt")
                slt(splitted[i])
            else if (splitted[i][0] == "sll")
                sll(splitted[i])


        }
    } else {
        while (lineValue < splitted_next.length)
            nextOnClick();

    }


}





let jumpPositions_Next = new Map()
let arrayAddresses_next = new Map();//even for strings
let lineValue = 0;
let splitted_next = []
let doc = ''
let oldLineValue = 0
next.addEventListener('click', nextOnClick)

function nextOnClick() {

    if (lineValue == 0) {

        nextButtonClicked = true

        memoryIndex = 0
        //console.log(myCodeMirror.getDoc().children[0].lines)
        //instructions = textArea.value.split(/\r?\n/)
        doc = myCodeMirror.getDoc()

        instructions = myCodeMirror.getDoc().children[0].lines
        myCodeMirror.getDoc().children.forEach((child) => {
            child.lines.forEach((ins) => {
                ins = ins.text.trim()
                splitted_next.push(ins.split(/[ ,.]+/))
            })
        })

        console.log(splitted_next)

        for (let j = 0; j < splitted_next.length; j++) {
            if (splitted_next[j][0][(splitted_next[j][0].length) - 1] == ':') {
                jumpPositions_Next.set((splitted_next[j][0].slice(0, splitted_next[j][0].length - 1)), j)
            }
        }
        // console.log(jumpPositions_Next)
        for (let i = 1; i > 0; i++) {
            if (splitted_next[i][1] == "text") {
                lineValue = i
                break;
            }
            else if (splitted_next[i][1] == "word") {
                if (splitted_next[i].length != 3)
                    arrayAddresses_next.set(splitted_next[i - 1][0].split(":")[0], memoryIndex)
                for (let j = 2; j < splitted_next[i].length; j++) {
                    // memory[memoryIndex - 1] = parseInt(splitted_next[i][j])
                    // memoryIndex += 1
                    let numberToBeStored = parseInt(splitted_next[i][j])
                    let BinaryEquivalent = (numberToBeStored >>> 0).toString(2)

                    let initialLength = BinaryEquivalent.length
                    for (let j = 0; j < (32 - initialLength); j += 1) {
                        BinaryEquivalent = "0" + BinaryEquivalent;
                    }

                    memory[memoryIndex] = BinaryEquivalent.slice(0, 8)
                    memory[memoryIndex + 1] = BinaryEquivalent.slice(8, 16)
                    memory[memoryIndex + 2] = BinaryEquivalent.slice(16, 24)
                    memory[memoryIndex + 3] = BinaryEquivalent.slice(24, 32)
                    memoryIndex += 4;
                }

                console.log(memory)
            }

        }
        displayMemory(memoryIndex)

    }



    //console.log(arrayAddresses_next)


    if (lineValue < splitted_next.length) {
        console.log(doc)
        doc.removeLineClass((oldLineValue), "background", "blueLine")
        doc.addLineClass((lineValue + 1), "background", "blueLine")
        oldLineValue = lineValue + 1
        lineValue += 1
        //console.log(registers.get("s3"))
        console.log(splitted_next[lineValue])
        if (splitted_next[lineValue][0] == "add")
            add(splitted_next[lineValue])
        else if (splitted_next[lineValue][0] == "sub")
            sub(splitted_next[lineValue])
        else if (splitted_next[lineValue][0] == "lw")
            lw(splitted_next[lineValue])
        else if (splitted_next[lineValue][0] == "sw")
            sw(splitted_next[lineValue], memoryIndex)
        else if (splitted_next[lineValue][0] == "beq")
            lineValue = beq(splitted_next[lineValue], lineValue, jumpPositions_Next)
        else if (splitted_next[lineValue][0] == "j")
            lineValue = jump(splitted_next[lineValue], jumpPositions_Next)
        else if (splitted_next[lineValue][0] == "addi")
            addi(splitted_next[lineValue])
        else if (splitted_next[lineValue][0] == "slt")
            slt(splitted_next[lineValue])
        else if (splitted_next[lineValue][0] == "sll")
            sll(splitted_next[lineValue])
        //sll
        console.log(registers)
    }
}








// .data
// array:
// .word 5, 6, 1
//     .text
//     .globl main

// main:
// addi $s0, $s0, 1
// addi $s1, $s1, 2


// for1:
// slt $s2, $s1, $at

// beq $s2, $s0, end

// addi $s3, $r0, 0

// for2:
// slt $s4, $s3, $s1

// beq $s4, $at, end2

// sll $t1, $s3, 2
// add $t1, $t1, $s0
// lw $t0, 0($t1)
// addi $t2, $s3, 1
// sll $t3, $t2, 2
// add $t3, $t3, $s0
// lw $t4, 0($t3)


// slt $t6, $t4, $t0
// beq $t6, $at, noswap


// sw $t4, 0($t1)
// sw $t0, 0($t3)

// noswap:

// addi $s3, $s3, 1
// j for2

// end2:
// addi $s1, $s1, -1
// j for1

// end:
