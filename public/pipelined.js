/*#TODO 
[ ] Fix all the bugs
[ ] Make sure that ID/RF isBeingWritten is set to true after operands isDirty is set
[ ] Think about other ways of data forwarding i.e. from WB,ID/RF,etc.
[ ] RAW in branch cases
[ ] Check for three ins in RAW
[ ] check for lw ans sw data hazards
[ ] If possible add graphics showing the cycle data.

*/

var textArea = document.getElementById("ide");
var submit = document.getElementById("submit");
var memory = [];
var instructions = [];
var wordAddresses = [];
let nextButtonClicked = false;

var myCodeMirror = CodeMirror.fromTextArea(textArea, {
  value: "Enter Code Here",
  lineNumbers: true,
  theme: "blackboard",
});

let PipelineStages = ["IF", "ID", "EX", "MEM", "WB"];

class Job {
  instruction = null;
  currentStage = 0;
}

for (let i = 0; i < 1024 * 8; i++) {
  memory.push(0);
}

//For changing tabs
$(".menu .item").tab();

document.getElementById("input_file").addEventListener("change", getFile);
//Code For Uploading a file
function getFile(event) {
  const input = event.target;
  if ("files" in input && input.files.length > 0) {
    placeFileContent(input.files[0]);
  }
}

function placeFileContent(file) {
  readFileContent(file)
    .then((content) => {
      myCodeMirror.setValue(content);
    })
    .catch((error) => console.log(error));
}

function readFileContent(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}
//===============================================================
//isBeingWritten denotes whether the the register is getting written in any other instruction. Is it's true then it's value is of no use.
var registers = new Map([
  ["r0", { value: 0, isBeingWritten: false }],
  ["at", { value: 0, isBeingWritten: false }],
  ["v0", { value: 0, isBeingWritten: false }],
  ["v1", { value: 0, isBeingWritten: false }],
  ["a0", { value: 0, isBeingWritten: false }],
  ["a1", { value: 0, isBeingWritten: false }],
  ["a2", { value: 0, isBeingWritten: false }],
  ["a3", { value: 0, isBeingWritten: false }],
  ["t0", { value: 0, isBeingWritten: false }],
  ["t1", { value: 0, isBeingWritten: false }],
  ["t2", { value: 0, isBeingWritten: false }],
  ["t3", { value: 0, isBeingWritten: false }],
  ["t4", { value: 0, isBeingWritten: false }],
  ["t5", { value: 0, isBeingWritten: false }],
  ["t6", { value: 0, isBeingWritten: false }],
  ["t7", { value: 0, isBeingWritten: false }],
  ["s0", { value: 0, isBeingWritten: false }],
  ["s1", { value: 0, isBeingWritten: false }],
  ["s2", { value: 0, isBeingWritten: false }],
  ["s3", { value: 0, isBeingWritten: false }],
  ["s4", { value: 0, isBeingWritten: false }],
  ["s5", { value: 0, isBeingWritten: false }],
  ["s6", { value: 0, isBeingWritten: false }],
  ["s7", { value: 0, isBeingWritten: false }],
  ["t8", { value: 0, isBeingWritten: false }],
  ["t9", { value: 0, isBeingWritten: false }],
  ["k0", { value: 0, isBeingWritten: false }],
  ["k1", { value: 0, isBeingWritten: false }],
  ["gp", { value: 0, isBeingWritten: false }],
  ["sp", { value: 0, isBeingWritten: false }],
  ["s8", { value: 0, isBeingWritten: false }],
  ["ra", { value: 0, isBeingWritten: false }],
]);
//console.log(registers)

let IF_UNIT = {
  locked: false,
  latch: null,
};
let ID_UNIT = {
  locked: false,
  latch: null,
};
let EX_UNIT = {
  locked: false,
  latch: null,
};
let MEM_UNIT = {
  locked: false,
  latch: null,
};
let WB_UNIT = {
  locked: false,
  latch: null,
};

let ALU_UNIT = [];
let temp_MEM_UNIT = []; //memoryWrite writes the result to this array. At the end of each cycle we add this result to ALU_UNIT. This prevents memory writes to the ALU_UNIT during the same cycle.

function unlockUnits() {
  IF_UNIT.locked = false;
  ID_UNIT.locked = false;
  EX_UNIT.locked = false;
  MEM_UNIT.locked = false;
  WB_UNIT.locked = false;
}

function displayRegisters() {
  let divReg = document.querySelector(".registerDiv");
  divReg.innerHTML = "";
  let i = 1;
  console.log(registers);
  registers.forEach((value, key) => {
    let h3text = ` "${key}" : ${(value.value >>> 0).toString(2)}`;
    let h3 = document.createElement("h4");
    h3.classList.add("item");
    h3.textContent = h3text;
    divReg.appendChild(h3);
    i += 1;
  });
  console.log(divReg.innerHTML);
}
displayRegisters();

function add(data) {
  let operand_1 = data.operand1;
  let operand_2 = data.operand2;

  if (operand_1.isDirty) {
    if (EX_UNIT.latch.rd === r1) {
      operand_1.value = EX_UNIT.WriteBackValue; //data forwarding from EX
    }
    if (MEM_UNIT.latch.rd === r1) {
      operand_1.value = MEM_UNIT.WriteBackValue; //data forwarding from MEM
    }
  }
  if (operand_2.isDirty) {
    if (EX_UNIT.latch.rd === r2) {
      operand_2.value = EX_UNIT.WriteBackValue;
    }
    if (MEM_UNIT.latch.rd === r2) {
      operand_2.value = MEM_UNIT.WriteBackValue;
    }
  }

  let sum = operand_1.value + operand_2.value;
  EX_UNIT.latch = {
    ...ID_UNIT.latch,
    WriteBackValue: sum,
  };
  //registers = registers.set(rd, sum);
  // console.log(registers)
  //displayRegisters();
}

function addi(data, cycle) {
  console.log("addi", data.operand1);
  let operand_1 = data.operand1;
  let arr = [...ALU_UNIT];
  console.log("ALU UNIT", arr);
  if (operand_1.isDirty) {
    let stall = true;
    for (let i = 0; i < ALU_UNIT.length; i++) {
      console.log(Object.keys(ALU_UNIT[i]), data.r1);
      if (Object.keys(ALU_UNIT[i]).indexOf(data.r1) != -1) {
        stall = false;
        operand_1.value = ALU_UNIT[i][data.r1];
        break;
      }
    }
    if (stall) return "stall";
    if (stall) {
      console.log("Stall");
    }
  }
  console.log(operand_1.value);
  let sum = operand_1.value + data.immediate;
  console.log("SUM", sum);
  EX_UNIT.latch = {
    ...ID_UNIT.latch,
    WriteBackValue: sum,
  };
  let rd = data.rd;

  let result = {};
  result[rd] = sum;
  ALU_UNIT.splice(0);
  ALU_UNIT.push(result);

  //registers = registers.set(rd, sum);
  // console.log(registers)
  //displayRegisters();
}

function sll(data) {
  let operand_1 = data.operand1;
  if (operand_1.isDirty) {
    if (EX_UNIT.latch.rd === r1) {
      operand_1.value = EX_UNIT.WriteBackValue; //data forwarding from EX
    }
    if (MEM_UNIT.latch.rd === r1) {
      operand_1.value = MEM_UNIT.WriteBackValue; //data forwarding from MEM
    }
  }
  let shiftedNum = operand_1 << parseInt(data.immediate);
  EX_UNIT.latch = {
    ...ID_UNIT.latch,
    WriteBackValue: shiftedNum,
  };
  // console.log(operand1, parseInt(decimal));
  //registers = registers.set(rd, shiftedNum);
  // console.log(registers)
  //displayRegisters();
}

function sub(data) {
  let operand_1 = data.operand1;
  let operand_2 = data.operand2;
  if (operand_1.isDirty) {
    if (EX_UNIT.latch.rd === r1) {
      operand_1.value = EX_UNIT.WriteBackValue; //data forwarding from EX
    }
    if (MEM_UNIT.latch.rd === r1) {
      operand_1.value = MEM_UNIT.WriteBackValue; //data forwarding from MEM
    }
  }

  if (operand_2.isDirty) {
    if (EX_UNIT.latch.rd === r2) {
      operand_2.value = EX_UNIT.WriteBackValue; //data forwarding from EX
    }
    if (MEM_UNIT.latch.rd === r2) {
      operand_2.value = MEM_UNIT.WriteBackValue; //data forwarding from MEM
    }
  }
  let diff = operand_1.value - operand_2.value;
  EX_UNIT.latch = {
    ...ID_UNIT.latch,
    WriteBackValue: diff,
  };
  // registers = registers.set(rd, diff);
  // displayRegisters();
}
function slt(data) {
  let operand_1 = data.operand1;
  let operand_2 = data.operand2;
  if (operand_1.isDirty) {
    if (EX_UNIT.latch.rd === r1) {
      operand_1.value = EX_UNIT.WriteBackValue; //data forwarding from EX
    }
    if (MEM_UNIT.latch.rd === r1) {
      operand_1.value = MEM_UNIT.WriteBackValue; //data forwarding from MEM
    }
  }

  if (operand_2.isDirty) {
    if (EX_UNIT.latch.rd === r2) {
      operand_2.value = EX_UNIT.WriteBackValue; //data forwarding from EX
    }
    if (MEM_UNIT.latch.rd === r2) {
      operand_2.value = MEM_UNIT.WriteBackValue; //data forwarding from MEM
    }
  }
  let value = 0;
  if (operand_1.value < operand_2.value) {
    value = 1;
  }
  EX_UNIT.latch = {
    ...ID_UNIT.latch,
    WriteBackValue: value,
  };

  //displayRegisters();
}

function lw(data) {
  let operand_1 = data.operand1;

  if (operand_1.isDirty) {
    if (EX_UNIT.latch.rd === r1) {
      operand_1.value = EX_UNIT.WriteBackValue; //data forwarding from EX
    }
    if (MEM_UNIT.latch.rd === r1) {
      operand_1.value = MEM_UNIT.WriteBackValue; //data forwarding from MEM
    }
  }

  let finalAddress = operand_1.value + data.immediate * 4;
  EX_UNIT.latch = {
    ...ID_UNIT.latch,
    loadAddress: finalAddress,
  };
  // console.log(finalAddress);
  // console.log(memory);

  //registers.set(rd, decimalValue);
  //displayRegisters();
  // let r1 = ins[2][1] + ins[2][2]
}

function sw(data, memoryIndex) {
  let operand_1 = data.operand1;

  if (operand_1.isDirty) {
    if (EX_UNIT.latch.rd === r1) {
      operand_1.value = EX_UNIT.WriteBackValue; //data forwarding from EX
    }
    if (MEM_UNIT.latch.rd === r1) {
      operand_1.value = MEM_UNIT.WriteBackValue; //data forwarding from MEM
    }
  }
  let finalAddress = operand_1.value + data.immediate * 4;
  EX_UNIT.latch = {
    ...ID_UNIT.latch,
    storeAddress: finalAddress,
  };

  //console.log(finalAddress);
  displayMemory(memoryIndex); //I have to change this
  //displayRegisters()
  // let r1 = ins[2][1] + ins[2][2]
}

function InstructionFetch(index, splitted) {
  //splitted is instruction array
  return splitted[index];
}

function InstructionDecode(jumpPositions) {
  let instructionToBeDecoded = IF_UNIT.latch;
  let instructionType = instructionToBeDecoded[0];
  if (
    instructionType === "add" ||
    instructionType === "sub" ||
    instructionType === "slt"
  ) {
    let rd = instructionToBeDecoded[1][1] + instructionToBeDecoded[1][2];
    let rdVal = registers.get(rd).value;
    registers.set(rd, { value: rdVal, isBeingWritten: true });
    let r1 = instructionToBeDecoded[2][1] + instructionToBeDecoded[2][2];
    let r2 = instructionToBeDecoded[3][1] + instructionToBeDecoded[3][2];
    let operand1 = registers.get(r1);
    let operand2 = registers.get(r2);
    ID_UNIT.latch = {
      instructionType,
      rd,
      r1,
      r2,
      operand1: { value: operand1.value, isDirty: operand1.isBeingWritten },
      operand2: { value: operand2.value, isDirty: operand2.isBeingWritten },
    };
    return null;
  }

  if (instructionType === "addi" || instructionType === "sll") {
    let rd = instructionToBeDecoded[1][1] + instructionToBeDecoded[1][2];
    let rdVal = registers.get(rd).value;
    //console.log("RDVAL", registers);
    registers.set(rd, { value: rdVal, isBeingWritten: true });
    let r1 = instructionToBeDecoded[2][1] + instructionToBeDecoded[2][2];
    let immediate = "";
    if (instructionToBeDecoded[3].slice(0, 2) == "0x") {
      immediate = parseInt(instructionToBeDecoded[3], 16);
    } else {
      immediate = parseInt(instructionToBeDecoded[3]);
    }
    if (immediate > Math.pow(2, 16))
      console.log("Instruction size is greater than 32 bits");
    let operand1 = registers.get(r1);
    let operand1Value = {
      value: operand1.value,
      isDirty: operand1.isBeingWritten,
    };
    console.log(operand1, operand1Value);
    ID_UNIT.latch = {
      instructionType,
      rd,
      r1,
      immediate,
      operand1: operand1Value,
    };
    console.log(ID_UNIT.latch);
    return null;
  }

  if (instructionType === "sw" || instructionType === "lw") {
    let rd = instructionToBeDecoded[1][1] + instructionToBeDecoded[1][2];
    if (instructionType === "lw") {
      let rdVal = registers.get(rd).value;
      registers.set(rd, { value: rdVal, isBeingWritten: true });
    }
    let offsetRegister = instructionToBeDecoded[2].split("("); //["0", "$t1)"]
    let r1 = offsetRegister[1].split(")")[0]; //$t1
    //console.log(r1);
    r1 = r1[1] + r1[2];
    //console.log(r1);
    let operand1 = registers.get(r1);
    ID_UNIT.latch = {
      instructionType,
      rd,
      immediate: offsetRegister[0],
      r1,
      rdVal: registers.get(rd).value,
      operand1: { value: operand1.value, isDirty: operand1.isBeingWritten },
    };
    return null;
  }
  if (instructionType == "jump") {
    return jumpPositions.get(instructionToBeDecoded[1]);
  }
  if (instructionType == "beq") {
    let r1 = instructionToBeDecoded[1][1] + instructionToBeDecoded[1][2];
    let r2 = instructionToBeDecoded[2][1] + instructionToBeDecoded[2][2];

    let r1Value = registers.get(r1);
    let r2Value = registers.get(r2);
    if (r1Value == r2Value) {
      return jumpPositions.get(instructionToBeDecoded[3]);
    } else {
      return -1; //-1 means no branch taken
    }
  }
}

function Execute(cycle) {
  console.log("From Execute", ID_UNIT.latch.operand1);
  let returnValue = null;
  if (ID_UNIT.latch.instructionType == "add") {
    returnValue = add(ID_UNIT.latch);
  } else if (ID_UNIT.latch.instructionType == "sub") {
    returnValue = sub(ID_UNIT.latch);
  } else if (ID_UNIT.latch.instructionType == "lw") {
    returnValue = lw(ID_UNIT.latch);
  } else if (ID_UNIT.latch.instructionType == "sw") {
    returnValue = sw(ID_UNIT.latch);
  } else if (ID_UNIT.latch.instructionType == "addi") {
    returnValue = addi(ID_UNIT.latch, cycle);
  } else if (ID_UNIT.latch.instructionType == "slt") {
    returnValue = slt(ID_UNIT.latch);
  } else if (ID_UNIT.latch.instructionType == "sll") {
    returnValue = sll(ID_UNIT.latch);
  }
  return returnValue;
}

function MemoryWrite(memoryIndex, cycle) {
  if (EX_UNIT.latch.instructionType === "lw") {
    let BinaryEquivalent = "";
    console.log(EX_UNIT.latch.loadAddress);
    BinaryEquivalent =
      memory[EX_UNIT.latch.loadAddress] +
      memory[EX_UNIT.latch.loadAddress + 1] +
      memory[EX_UNIT.latch.loadAddress + 2] +
      memory[EX_UNIT.latch.loadAddress + 3];
    //console.log(BinaryEquivalent);
    //console.log(parseInt(BinaryEquivalent.slice(1, 32), 2), Math.pow(2 * parseInt(BinaryEquivalent[0]), 31))
    let decimalValue =
      parseInt(BinaryEquivalent.slice(1, 32), 2) -
      Math.pow(2 * parseInt(BinaryEquivalent[0]), 31); // Using 2s complement property
    console.log(decimalValue);
    MEM_UNIT.latch = {
      ...EX_UNIT.latch,
      WriteBackValue: decimalValue,
      cycle,
    };
    let result = {};
    result[EX_UNIT.latch.rd] = decimalValue;
    temp_MEM_UNIT.slice(0);
    temp_MEM_UNIT.push(result);
    console.log(temp_MEM_UNIT);
    //console.log(decimalValue)
    return;
  } else if (EX_UNIT.latch.instructionType === "sw") {
    let numberToBeStored = EX_UNIT.latch.rdVal; //#TODO Handle Data Forwarind Here
    let BinaryEquivalent = (numberToBeStored >>> 0).toString(2);

    let initialLength = BinaryEquivalent.length;
    for (let j = 0; j < 32 - initialLength; j += 1) {
      BinaryEquivalent = "0" + BinaryEquivalent;
    }

    memory[EX_UNIT.latch.storeAddress] = BinaryEquivalent.slice(0, 8);
    memory[EX_UNIT.latch.storeAddress + 1] = BinaryEquivalent.slice(8, 16);
    memory[EX_UNIT.latch.storeAddress + 2] = BinaryEquivalent.slice(16, 24);
    memory[EX_UNIT.latch.storeAddress + 3] = BinaryEquivalent.slice(24, 32);
    //console.log(memory);
    if (EX_UNIT.latch.storeAddress >= memoryIndex) {
      wordAddresses.push(EX_UNIT.latch.storeAddress);
      //console.log(EX_UNIT.latch.storeAddress);
    }

    MEM_UNIT.latch = {
      ...EX_UNIT.latch,
      WriteBackValue: null,
    };
  } else {
    MEM_UNIT.latch = {
      ...EX_UNIT.latch,
    };
  }
}

function WriteBack(memoryIndex) {
  console.log("MEMUNIT", MEM_UNIT);
  if (MEM_UNIT.latch.WriteBackValue) {
    registers.set(MEM_UNIT.latch.rd, {
      value: MEM_UNIT.latch.WriteBackValue,
      isBeingWritten: false,
    });
  }
}

function displayMemory(memoryIndex) {
  //console.log(memoryIndex);
  let memDiv = document.querySelector(".memoryDiv");
  memDiv.innerHTML = "";
  for (let i = 0; i < memoryIndex; i += 4) {
    let span = document.createElement("span");
    span.classList.add("item");
    span.innerText =
      "\n[0x" +
      i.toString(16) +
      "]: " +
      memory[i] +
      " " +
      memory[i + 1] +
      " " +
      memory[i + 2] +
      " " +
      memory[i + 3] +
      "  ";
    memDiv.appendChild(span);
  }
  //console.log(wordAddresses);
  for (let i = 0; i < wordAddresses.length; i++) {
    let span = document.createElement("span");
    span.classList.add("item");
    span.innerText =
      "\n[0x" +
      wordAddresses[i].toString(16) +
      "]: " +
      memory[wordAddresses[i] - 1] +
      "  " +
      memory[wordAddresses[i]] +
      " " +
      memory[wordAddresses[i] + 1] +
      " " +
      memory[wordAddresses[i] + 2] +
      " ";
    memDiv.appendChild(span);
  }
}

submit.onclick = () => {
  let memoryIndex = 0;

  let splitted = [];

  myCodeMirror.getDoc().children.forEach((child) => {
    child.lines.forEach((ins) => {
      ins = ins.text.trim();
      if (ins != "") {
        splitted.push(ins.split(/[ ,.]+/));
      }
    });
  });

  let jumpPositions = new Map();
  console.log(splitted);

  for (let j = 0; j < splitted.length; j++) {
    if (splitted[j][0][splitted[j][0].length - 1] == ":") {
      jumpPositions.set(splitted[j][0].slice(0, splitted[j][0].length - 1), j);
      let x = splitted.splice(j, 1); //removes all jump positions
    }
  }
  console.log(jumpPositions);

  let arrayAddresses = new Map(); //even for strings

  for (let i = 0; i >= 0; i++) {
    if (splitted[i][1] == "text") break;
    else if (splitted[i][1] == "word") {
      if (splitted[i].length != 3)
        arrayAddresses.set(splitted[i - 1][0].split(":")[0], memoryIndex);
      for (let j = 2; j < splitted[i].length; j++) {
        let numberToBeStored = parseInt(splitted[i][j]);
        let BinaryEquivalent = (numberToBeStored >>> 0).toString(2);

        let initialLength = BinaryEquivalent.length;
        for (let j = 0; j < 32 - initialLength; j += 1) {
          BinaryEquivalent = "0" + BinaryEquivalent;
        }

        memory[memoryIndex] = BinaryEquivalent.slice(0, 8);
        memory[memoryIndex + 1] = BinaryEquivalent.slice(8, 16);
        memory[memoryIndex + 2] = BinaryEquivalent.slice(16, 24);
        memory[memoryIndex + 3] = BinaryEquivalent.slice(24, 32);
        memoryIndex += 4;
      }
    }
  }

  displayMemory(memoryIndex);

  let nextInstructionIndex = jumpPositions.get("main");
  let InstructionQueue = [];
  let cycle = 0;
  let NumberOfStalls = 0;

  let temp = new Job();
  temp.currentStage = 0;
  //temp.functionTobeCalled=()=>{InstructionFetch(nextInstructionIndex,splitted)};
  temp.instruction = splitted[nextInstructionIndex];
  //console.log("Temp", temp);
  InstructionQueue.push(temp);

  while (InstructionQueue.length != 0) {
    cycle++;
    //console.log(cycle, InstructionQueue);
    let currentJobs = InstructionQueue.length;
    let stall = false;
    //console.log("Current Jobs", currentJobs);
    for (let i = 0; i < currentJobs; i++) {
      let currentJob = InstructionQueue[0];
      if (!stall) {
        //console.log(currentJob);
        switch (currentJob.currentStage) {
          case 0: {
            console.log("IF");
            if (!IF_UNIT.locked) {
              IF_UNIT.locked = true;
              currentJob.instruction = InstructionFetch(
                nextInstructionIndex,
                splitted
              );
              nextInstructionIndex++;
              IF_UNIT.latch = currentJob.instruction;
              currentJob.currentStage++;
              InstructionQueue.shift(); //removes the first element in the array
              InstructionQueue.push(currentJob);
            } else {
              stall = true;
              InstructionQueue.shift();
              InstructionQueue.push(currentJob);
            }
            break;
          }
          case 1: {
            if (!ID_UNIT.locked) {
              console.log("ID");
              ID_UNIT.locked = true;
              let newPC = InstructionDecode(jumpPositions);

              if (newPC) {
                if (newPC != -1) {
                  nextInstructionIndex = newPC;
                }
                stall = true;
              } else {
                currentJob.currentStage++;
                InstructionQueue.push(currentJob);
              }
              InstructionQueue.shift(); //removes the first element in the array
            } else {
              stall = true;
              InstructionQueue.shift();
              InstructionQueue.push(currentJob);
            }
            break;
          }
          case 2: {
            //execution
            console.log(ID_UNIT.latch.operand1);
            console.log("EX");
            if (!EX_UNIT.locked) {
              EX_UNIT.locked = true;

              let returnVal = Execute(cycle);
              if (returnVal === "stall") {
                stall = true;
                InstructionQueue.shift();
                InstructionQueue.push(currentJob);
              } else {
                currentJob.currentStage++;
                InstructionQueue.push(currentJob);
                InstructionQueue.shift(); //removes the first element in the array
              }
            } else {
              stall = true;
              InstructionQueue.shift();
              InstructionQueue.push(currentJob);
            }
            break;
          }

          case 3: {
            //MEM
            console.log("MEM");
            if (!MEM_UNIT.locked) {
              MEM_UNIT.locked = true;

              MemoryWrite(memoryIndex, cycle);

              currentJob.currentStage++;
              InstructionQueue.push(currentJob);
              InstructionQueue.shift(); //removes the first element in the array
            } else {
              stall = true;
              InstructionQueue.shift();
              InstructionQueue.push(currentJob);
            }
            break;
          }
          case 4: {
            //MEM
            console.log("WB");
            if (!WB_UNIT.locked) {
              WB_UNIT.locked = true;
              console.log(MEM_UNIT);
              WriteBack(memoryIndex);
              InstructionQueue.shift(); //removes the first element in the array
            } else {
              stall = true;
              InstructionQueue.shift();
              InstructionQueue.push(currentJob);
            }
            break;
          }
        }
        if (stall) {
          NumberOfStalls++;
        } else {
          if (currentJob.currentStage === 1) {
            //We fetch new instruction only when old instruction was fetched and there's no stall
            if (nextInstructionIndex < splitted.length) {
              //add next instruction only if its available
              let nextInstruction = new Job();
              nextInstruction.currentStage = 0;
              nextInstruction.instruction = splitted[nextInstructionIndex];
              InstructionQueue.push(nextInstruction);
            }
          }
        }
      } else {
        InstructionQueue.shift();
        InstructionQueue.push(currentJob);
      }
      // if (tem)
      //ALU_UNIT.push(temp_MEM_UNIT);
    }
    ALU_UNIT = ALU_UNIT.concat(temp_MEM_UNIT);
    let pr = ALU_UNIT.length;
    console.log(pr);

    unlockUnits();
  }

  displayMemory(memoryIndex);
  displayRegisters();
  console.log("cycles", cycle);
  console.log("Stalls", NumberOfStalls);
  console.log(registers);

  //     for (let i = 0; i < splitted.length; i++) {
  //       console.log(registers.get("s3"));
  //       console.log(splitted[i]);
  //       if (splitted[i][0] == "add") add(splitted[i]);
  //       else if (splitted[i][0] == "sub") sub(splitted[i]);
  //       else if (splitted[i][0] == "lw") lw(splitted[i]);
  //       else if (splitted[i][0] == "sw") sw(splitted[i], memoryIndex);
  //       else if (splitted[i][0] == "beq") i = beq(splitted[i], i, jumpPositions);
  //       else if (splitted[i][0] == "j") i = jump(splitted[i], jumpPositions);
  //       else if (splitted[i][0] == "addi") addi(splitted[i]);
  //       else if (splitted[i][0] == "slt") slt(splitted[i]);
  //       else if (splitted[i][0] == "sll") sll(splitted[i]);
  //     }
  //   } else {
  //     while (lineValue < splitted_next.length) nextOnClick();
  //   }
};

// let jumpPositions_Next = new Map();
// let arrayAddresses_next = new Map(); //even for strings
// let lineValue = 0;
// let splitted_next = [];
// let doc = "";
// let oldLineValue = 0;
// next.addEventListener("click", nextOnClick);

// function nextOnClick() {
//   if (lineValue == 0) {
//     nextButtonClicked = true;

//     let memoryIndex = 0;
//     //console.log(myCodeMirror.getDoc().children[0].lines)
//     //instructions = textArea.value.split(/\r?\n/)
//     doc = myCodeMirror.getDoc();

//     instructions = myCodeMirror.getDoc().children[0].lines;
//     myCodeMirror.getDoc().children.forEach((child) => {
//       child.lines.forEach((ins) => {
//         ins = ins.text.trim();
//         splitted_next.push(ins.split(/[ ,.]+/));
//       });
//     });

//     console.log(splitted_next);

//     for (let j = 0; j < splitted_next.length; j++) {
//       if (splitted_next[j][0][splitted_next[j][0].length - 1] == ":") {
//         jumpPositions_Next.set(
//           splitted_next[j][0].slice(0, splitted_next[j][0].length - 1),
//           j
//         );
//       }
//     }
//     // console.log(jumpPositions_Next)
//     for (let i = 0; i >= 0; i++) {
//       if (splitted_next[i][1] == "text") {
//         lineValue = i;
//         break;
//       } else if (splitted_next[i][1] == "word") {
//         if (splitted_next[i].length != 3)
//           arrayAddresses_next.set(
//             splitted_next[i - 1][0].split(":")[0],
//             memoryIndex
//           );
//         for (let j = 2; j < splitted_next[i].length; j++) {
//           // memory[memoryIndex - 1] = parseInt(splitted_next[i][j])
//           // memoryIndex += 1
//           let numberToBeStored = parseInt(splitted_next[i][j]);
//           let BinaryEquivalent = (numberToBeStored >>> 0).toString(2);

//           let initialLength = BinaryEquivalent.length;
//           for (let j = 0; j < 32 - initialLength; j += 1) {
//             BinaryEquivalent = "0" + BinaryEquivalent;
//           }

//           memory[memoryIndex] = BinaryEquivalent.slice(0, 8);
//           memory[memoryIndex + 1] = BinaryEquivalent.slice(8, 16);
//           memory[memoryIndex + 2] = BinaryEquivalent.slice(16, 24);
//           memory[memoryIndex + 3] = BinaryEquivalent.slice(24, 32);
//           memoryIndex += 4;
//         }

//         console.log(memory);
//       }
//     }
//     displayMemory(memoryIndex);
//   }

//   //console.log(arrayAddresses_next)

//   if (lineValue < splitted_next.length) {
//     console.log(doc);
//     doc.removeLineClass(oldLineValue, "background", "blueLine");
//     doc.addLineClass(lineValue + 1, "background", "blueLine");
//     oldLineValue = lineValue + 1;
//     lineValue += 1;
//     //console.log(registers.get("s3"))
//     console.log(splitted_next[lineValue]);
//     if (splitted_next[lineValue][0] == "add") add(splitted_next[lineValue]);
//     else if (splitted_next[lineValue][0] == "sub")
//       sub(splitted_next[lineValue]);
//     else if (splitted_next[lineValue][0] == "lw") lw(splitted_next[lineValue]);
//     else if (splitted_next[lineValue][0] == "sw")
//       sw(splitted_next[lineValue], memoryIndex);
//     else if (splitted_next[lineValue][0] == "beq")
//       lineValue = beq(splitted_next[lineValue], lineValue, jumpPositions_Next);
//     else if (splitted_next[lineValue][0] == "j")
//       lineValue = jump(splitted_next[lineValue], jumpPositions_Next);
//     else if (splitted_next[lineValue][0] == "addi")
//       addi(splitted_next[lineValue]);
//     else if (splitted_next[lineValue][0] == "slt")
//       slt(splitted_next[lineValue]);
//     else if (splitted_next[lineValue][0] == "sll")
//       sll(splitted_next[lineValue]);
//     //sll
//     console.log(registers);
//   }
// }

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

// end
