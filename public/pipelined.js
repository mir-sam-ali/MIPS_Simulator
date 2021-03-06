/*


*/

var textArea = document.getElementById("ide");
var submit = document.getElementById("submit");
var memory = [];
var instructions = [];
var wordAddresses = [];
let nextButtonClicked = false;
let timelineButton = document.getElementById("timeline");

var myCodeMirror = CodeMirror.fromTextArea(textArea, {
  value: "Enter Code Here",
  lineNumbers: true,
  theme: "blackboard",
});

class Job {
  instruction = null;
  currentStage = 0;
}

for (let i = 0; i < 1024 * 10; i++) {
  memory.push(0);
}

//For changing tabs
$(".menu .item").tab();
$("select.dropdown").dropdown();

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
/*

  CACHE RELATED CODE

*/
//configuration

class Node {
  left = null;
  right = null;
  block = null;
  tag = null;
  isDirty = false;

  constructor(block1, tag1) {
    this.block = block1;
    this.tag = tag1;
  }
}

let CACHE_DATA_L1 = {
  cacheSize: 2048, //bytes
  blockSize: 64, //bytes
  associativity: 4, //number of blocks in one set
  accessLatency: 1, //cycles,
  memoryAccessTime: 5,
};
let CACHE_DATA_L2 = {
  cacheSize: 4096, //bytes
  blockSize: 64, //bytes
  associativity: 4, //number of blocks in one set
  accessLatency: 4, //cycles
};
let CACHE_L1 = [];
let CACHE_L2 = [];

let calculate_cache = () => {
  CACHE_L1 = [];
  CACHE_L2 = [];
  CACHE_DATA_L1.NumberOfSets =
    CACHE_DATA_L1.cacheSize /
    (CACHE_DATA_L1.associativity * CACHE_DATA_L1.blockSize);
  CACHE_DATA_L1.offsetBits = Math.log2(CACHE_DATA_L1.blockSize);
  CACHE_DATA_L1.indexBits = Math.log2(CACHE_DATA_L1.NumberOfSets);
  CACHE_DATA_L1.tagBits =
    32 - CACHE_DATA_L1.offsetBits - CACHE_DATA_L1.indexBits;
  CACHE_DATA_L1.calls = 0;
  CACHE_DATA_L1.misses = 0;
  CACHE_DATA_L1.hits = 0;

  for (let i = 0; i < CACHE_DATA_L1.NumberOfSets; i++) {
    let set = { cache_line: new Map(), head: null, tail: null };
    CACHE_L1.push(set);
  }
  console.log("MyCache", CACHE_L1);
  console.log("Tag bits", CACHE_DATA_L1.tagBits);
  console.log("index bits", CACHE_DATA_L1.indexBits);
  console.log("offset bits", CACHE_DATA_L1.offsetBits);

  CACHE_DATA_L2.NumberOfSets =
    CACHE_DATA_L2.cacheSize /
    (CACHE_DATA_L2.blockSize * CACHE_DATA_L2.associativity);
  CACHE_DATA_L2.offsetBits = Math.log2(CACHE_DATA_L2.blockSize);
  CACHE_DATA_L2.indexBits = Math.log2(CACHE_DATA_L2.NumberOfSets);
  CACHE_DATA_L2.tagBits =
    32 - CACHE_DATA_L2.offsetBits - CACHE_DATA_L2.indexBits;

  CACHE_DATA_L2.calls = 0;
  CACHE_DATA_L2.misses = 0;
  CACHE_DATA_L2.hits = 0;
  //let CACHE_L2 = [];
  for (let i = 0; i < CACHE_DATA_L2.NumberOfSets; i++) {
    let set = { cache_line: new Map(), head: null, tail: null };
    CACHE_L2.push(set);
  }
  console.log("MyCache2", CACHE_L2);
};
calculate_cache();
let addCacheConfig = (e) => {
  e.preventDefault();
  let sizeCachel1 = parseInt($("#cache_l1_size")[0].value);
  let sizeUnitl1 = parseInt($("#cache_l1_size_unit")[0].value);
  CACHE_DATA_L1.cacheSize = sizeCachel1 * sizeUnitl1;
  CACHE_DATA_L1.blockSize = parseInt($("#cache_l1_size_block")[0].value);
  CACHE_DATA_L1.associativity = parseInt($("#cache_l1_associativity")[0].value);
  CACHE_DATA_L1.accessLatency = parseInt(
    $("#cache_l1_access_latency")[0].value
  );

  let sizeCachel2 = parseInt($("#cache_l2_size")[0].value);
  let sizeUnitl2 = parseInt($("#cache_l2_size_unit")[0].value);
  CACHE_DATA_L2.cacheSize = sizeCachel2 * sizeUnitl2;
  CACHE_DATA_L2.blockSize = parseInt($("#cache_l2_size_block")[0].value);
  CACHE_DATA_L2.associativity = parseInt($("#cache_l2_associativity")[0].value);
  CACHE_DATA_L2.accessLatency = parseInt(
    $("#cache_l2_access_latency")[0].value
  );
  CACHE_DATA_L1.memoryAccessTime = parseInt($("#memory_access")[0].value);
  calculate_cache();
};

let config_set_button = document.getElementById("config_set");
config_set_button.onclick = (e) => {
  addCacheConfig(e);
  console.log(CACHE_DATA_L1, CACHE_DATA_L2);
};

let rearrangeSet = (head, tail, target) => {
  if (target == tail) {
    return [head, tail];
  }

  if (target == head) {
    target.right.left = target.left;
    head = target.right;
    tail.right = target;
    target.left = tail;
    tail = target;
    target.right = null;
  } else if (target != tail) {
    target.left.right = target.right;
    target.right.left = target.left;
    target.left = tail;
    tail.right = target;
    tail = target;
    target.right = null;
  }
  return [head, tail];
};

let getDataFromCacheL1 = (address, numberOfBytes) => {
  CACHE_DATA_L1.calls++;
  //address has to be sent as binary
  memory[16] = 5;
  let oldLength = address.length;
  for (let i = 0; i < 32 - oldLength; i++) {
    address = "0" + address;
  }

  let tagBitsOfAddress = address.slice(0, CACHE_DATA_L1.tagBits);
  let tagValue = parseInt(tagBitsOfAddress, 2); //decimal value of tag
  let indexBitsOfAddress = address.slice(
    CACHE_DATA_L1.tagBits,
    CACHE_DATA_L1.indexBits + CACHE_DATA_L1.tagBits
  );
  let indexValue = parseInt(indexBitsOfAddress, 2);
  let offsetBitsOfAddress = address.slice(
    CACHE_DATA_L1.tagBits + CACHE_DATA_L1.indexBits,
    address.length
  );
  let offsetValue = parseInt(offsetBitsOfAddress, 2);
  console.log(tagBitsOfAddress, indexBitsOfAddress, offsetBitsOfAddress);

  let respectiveSet = CACHE_L1[indexValue];

  if (respectiveSet.cache_line.has(tagValue)) {
    CACHE_DATA_L1.hits++;
    //CACHE HIT
    console.log("CACHE HIT");
    [respectiveSet.head, respectiveSet.tail] = rearrangeSet(
      respectiveSet.head,
      respectiveSet.tail,
      respectiveSet.cache_line.get(tagValue)
    );

    let returnValue = [];
    let cost = CACHE_DATA_L1.accessLatency;
    for (let j = 0; j < numberOfBytes; j++) {
      if (offsetValue + j >= 64) {
        let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

        for (let k = 0; k < CACHE_DATA_L1.offsetBits; k++) {
          newAddress += "0";
        }
        let remainingBytes = getDataFromCacheL1(newAddress, numberOfBytes - j);
        returnValue = returnValue.concat(remainingBytes.value);
        cost += remainingBytes.cost;
        break;
      }
      returnValue.push(
        respectiveSet.cache_line.get(tagValue).block[offsetValue + j]
      );
    }
    return {
      value: returnValue,
      cost,
    };
  }
  CACHE_DATA_L1.misses++;
  let dataFromL2 = getDataFromCacheL2(address);
  let NodeFromL2 = { ...dataFromL2.node };
  NodeFromL2.tag = tagValue;
  let cost = dataFromL2.cost; //I'm not adding L1 cache latency here

  if (respectiveSet.cache_line.size === CACHE_DATA_L1.associativity) {
    //evict
    console.log("Eviction from load l1");

    if (respectiveSet.head.isDirty) {
      //et temp=storeDataInCacheL2()
      let addressOfTheBlock = respectiveSet.head.tag + indexValue + offsetValue;
      addBlockToL2(addressOfTheBlock, respectiveSet.head);
    }

    //let newNode = new Node(block, tagValue);
    let newNode = NodeFromL2;
    let nodeToBeDel = respectiveSet.head;
    respectiveSet.head.left = null;
    respectiveSet.head = respectiveSet.head.right;

    respectiveSet.cache_line.delete(nodeToBeDel.tag);
    newNode.left = respectiveSet.tail;
    newNode.right = null;
    respectiveSet.tail.right = newNode;
    respectiveSet.tail = newNode;
    respectiveSet.cache_line.set(tagValue, newNode);

    let returnValue = [];

    for (let j = 0; j < numberOfBytes; j++) {
      if (offsetValue + j >= 64) {
        let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

        for (let k = 0; k < CACHE_DATA_L1.offsetBits; k++) {
          newAddress += "0";
        }
        let remainingBytes = getDataFromCacheL1(newAddress, numberOfBytes - j);
        returnValue = returnValue.concat(remainingBytes.value);
        cost += remainingBytes.cost;
        break;
      }
      returnValue.push(newNode.block[offsetValue + j]);
    }
    return {
      value: returnValue,
      cost,
    };
  } else {
    //load

    //respectiveSet.cache_line.set(tagValue, block);

    if (respectiveSet.head == null) {
      //let newNode = new Node(block, tagValue);
      let newNode = NodeFromL2;
      newNode.right = null;
      respectiveSet.cache_line.set(tagValue, newNode);
      respectiveSet.head = newNode;
      respectiveSet.tail = newNode;
    } else {
      //let newNode = new Node(block, tagValue);
      let newNode = NodeFromL2;
      newNode.right = null;
      respectiveSet.cache_line.set(tagValue, newNode);
      respectiveSet.tail.right = newNode;
      newNode.left = respectiveSet.tail;
      respectiveSet.tail = newNode;
    }
    let returnValue = [];

    for (let j = 0; j < numberOfBytes; j++) {
      if (offsetValue + j >= 64) {
        let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

        for (let k = 0; k < CACHE_DATA_L1.offsetBits; k++) {
          newAddress += "0";
        }
        let remainingBytes = getDataFromCacheL1(newAddress, numberOfBytes - j);
        returnValue = returnValue.concat(remainingBytes.value);
        cost += remainingBytes.cost;
        break;
      }
      returnValue.push(NodeFromL2.block[offsetValue + j]);
    }
    return {
      value: returnValue,
      cost,
    };
  }
};

let storeDataInCacheL1 = (address, value) => {
  CACHE_DATA_L1.calls++;
  let oldLength = address.length;
  for (let i = 0; i < 32 - oldLength; i++) {
    address = "0" + address;
  }

  let tagBitsOfAddress = address.slice(0, CACHE_DATA_L1.tagBits);
  let tagValue = parseInt(tagBitsOfAddress, 2); //decimal value of tag
  let indexBitsOfAddress = address.slice(
    CACHE_DATA_L1.tagBits,
    CACHE_DATA_L1.indexBits + CACHE_DATA_L1.tagBits
  );
  let indexValue = parseInt(indexBitsOfAddress, 2);
  let offsetBitsOfAddress = address.slice(
    CACHE_DATA_L1.tagBits + CACHE_DATA_L1.indexBits,
    address.length
  );
  let offsetValue = parseInt(offsetBitsOfAddress, 2);
  console.log(tagBitsOfAddress, indexBitsOfAddress, offsetBitsOfAddress);

  let respectiveSet = CACHE_L1[indexValue];

  if (respectiveSet.cache_line.has(tagValue)) {
    CACHE_DATA_L1.hits++;
    //CACHE HIT
    console.log("CACHE HIT");
    [respectiveSet.head, respectiveSet.tail] = rearrangeSet(
      respectiveSet.head,
      respectiveSet.tail,
      respectiveSet.cache_line.get(tagValue)
    );
    let numberOfBytes = value.length;
    let cost = CACHE_DATA_L1.accessLatency;
    for (let j = 0; j < numberOfBytes; j++) {
      if (offsetValue + j >= 64) {
        let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

        for (let k = 0; k < CACHE_DATA_L1.offsetBits; k++) {
          newAddress += "0";
        }
        let extraCost = storeDataInCacheL1(
          newAddress,
          value.slice(j, numberOfBytes)
        );

        cost += extraCost;
        break;
      }
      respectiveSet.cache_line.get(tagValue).block[offsetValue + j] = value[j];
    }

    //respectiveSet.cache_line.get(tagValue).block[offsetValue] = value;
    respectiveSet.cache_line.get(tagValue).isDirty = true;
    return cost;
  }
  CACHE_DATA_L1.misses++;
  let dataFromL2 = storeDataInCacheL2(address, value);

  let NodeFromL2 = { ...dataFromL2.node };
  NodeFromL2.tag = tagValue;

  let cost = dataFromL2.cost;

  if (respectiveSet.cache_line.size === CACHE_DATA_L1.associativity) {
    //evict

    if (respectiveSet.head.isDirty) {
      //et temp=storeDataInCacheL2()
      let addressOfTheBlock = respectiveSet.head.tag + indexValue + offsetValue;
      addBlockToL2(addressOfTheBlock, respectiveSet.head);
    }
    console.log("Eviction from store l1");

    let newNode = NodeFromL2;
    newNode.right = null;
    let nodeToBeDel = respectiveSet.head;
    respectiveSet.head.left = null;
    respectiveSet.head = respectiveSet.head.right;

    respectiveSet.cache_line.delete(nodeToBeDel.tag);
    newNode.left = respectiveSet.tail;
    respectiveSet.tail.right = newNode;
    respectiveSet.tail = newNode;
    newNode.isDirty = true;

    let numberOfBytes = value.length;

    for (let j = 0; j < numberOfBytes; j++) {
      if (offsetValue + j >= 64) {
        let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

        for (let k = 0; k < CACHE_DATA_L1.offsetBits; k++) {
          newAddress += "0";
        }
        let extraCost = storeDataInCacheL1(
          newAddress,
          value.slice(j, numberOfBytes)
        );

        cost += extraCost;
        break;
      }
      newNode.block[offsetValue + j] = value[j];
    }
    respectiveSet.cache_line.set(tagValue, newNode);
    return cost;
  } else {
    //load

    //respectiveSet.cache_line.set(tagValue, block);

    if (respectiveSet.head == null) {
      let newNode = NodeFromL2;
      newNode.right = null;
      respectiveSet.cache_line.set(tagValue, newNode);
      respectiveSet.head = newNode;
      respectiveSet.tail = newNode;

      let numberOfBytes = value.length;

      for (let j = 0; j < numberOfBytes; j++) {
        if (offsetValue + j >= 64) {
          let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

          for (let k = 0; k < CACHE_DATA_L1.offsetBits; k++) {
            newAddress += "0";
          }
          let extraCost = storeDataInCacheL1(
            newAddress,
            value.slice(j, numberOfBytes)
          );

          cost += extraCost;
          break;
        }
        newNode.block[offsetValue + j] = value[j];
      }
      respectiveSet.cache_line.set(tagValue, newNode);
      newNode.isDirty = true;
      return cost;
    } else {
      let newNode = NodeFromL2;
      newNode.right = null;
      respectiveSet.cache_line.set(tagValue, newNode);
      respectiveSet.tail.right = newNode;
      newNode.left = respectiveSet.tail;
      respectiveSet.tail = newNode;

      let numberOfBytes = value.length;

      for (let j = 0; j < numberOfBytes; j++) {
        if (offsetValue + j >= 64) {
          let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

          for (let k = 0; k < CACHE_DATA_L1.offsetBits; k++) {
            newAddress += "0";
          }
          let extraCost = storeDataInCacheL1(
            newAddress,
            value.slice(j, numberOfBytes)
          );

          cost += extraCost;
          break;
        }
        newNode.block[offsetValue + j] = value[j];
      }
      respectiveSet.cache_line.set(tagValue, newNode);
      newNode.isDirty = true;
      return cost;
    }
  }
};

let addBlockToL2 = (address, node) => {
  address = address.toString(2);
  let oldLength = address.length;
  for (let i = 0; i < 32 - oldLength; i++) {
    address = "0" + address;
  }
  let tagBitsOfAddress = address.slice(0, CACHE_DATA_L2.tagBits);
  let tagValue = parseInt(tagBitsOfAddress, 2); //decimal value of tag
  let indexBitsOfAddress = address.slice(
    CACHE_DATA_L2.tagBits,
    CACHE_DATA_L2.indexBits + CACHE_DATA_L2.tagBits
  );
  console.log("cndsk", tagValue);
  let indexValue = parseInt(indexBitsOfAddress, 2);

  let respectiveSet = CACHE_L2[indexValue];
  if (respectiveSet.cache_line.has(tagValue)) {
    //CACHE HIT

    respectiveSet.cache_line.get(tagValue).block = [...node.block];
    respectiveSet.cache_line.get(tagValue).isDirty = true;
    return;
  }
  //if it's not there in L2 cache then just write to memory
  for (let i = 0; i < CACHE_DATA_L2.blockSize; i++) {
    memory[parseInt(tagBitsOfAddress + indexBitsOfAddress, 2) + i] =
      node.block[i];
  }
  console.log(memory);
};

let getDataFromCacheL2 = (address) => {
  CACHE_DATA_L2.calls++;
  //address has to be sent as binary
  memory[16] = 5;
  let oldLength = address.length;
  for (let i = 0; i < 32 - oldLength; i++) {
    address = "0" + address;
  }

  let tagBitsOfAddress = address.slice(0, CACHE_DATA_L2.tagBits);
  let tagValue = parseInt(tagBitsOfAddress, 2); //decimal value of tag
  let indexBitsOfAddress = address.slice(
    CACHE_DATA_L2.tagBits,
    CACHE_DATA_L2.indexBits + CACHE_DATA_L2.tagBits
  );
  let indexValue = parseInt(indexBitsOfAddress, 2);
  let offsetBitsOfAddress = address.slice(
    CACHE_DATA_L2.tagBits + CACHE_DATA_L2.indexBits,
    address.length
  );
  let offsetValue = parseInt(offsetBitsOfAddress, 2);
  console.log(tagBitsOfAddress, indexBitsOfAddress, offsetBitsOfAddress);

  let respectiveSet = CACHE_L2[indexValue];

  if (respectiveSet.cache_line.has(tagValue)) {
    //CACHE HIT
    CACHE_DATA_L2.hits++;
    console.log("CACHE HIT in L2");
    [respectiveSet.head, respectiveSet.tail] = rearrangeSet(
      respectiveSet.head,
      respectiveSet.tail,
      respectiveSet.cache_line.get(tagValue)
    );
    return {
      node: respectiveSet.cache_line.get(tagValue),
      cost: CACHE_DATA_L2.accessLatency,
    };
  }
  CACHE_DATA_L2.misses++;

  if (respectiveSet.cache_line.size === CACHE_DATA_L2.associativity) {
    //evict
    console.log("Eviction l2l");
    //writing to memory
    if (respectiveSet.head.isDirty === true) {
      for (let i = 0; i < CACHE_DATA_L2.blockSize; i++) {
        memory[parseInt(head.tag + indexBitsOfAddress, 2) + i] =
          respectiveSet.head.block[i];
      }
    }
    let block = [];
    for (let i = 0; i < CACHE_DATA_L2.blockSize; i++) {
      block[i] = memory[tagValue + i];
    }
    let newNode = new Node(block, tagValue);
    let nodeToBeDel = respectiveSet.head;
    respectiveSet.head.left = null;
    respectiveSet.head = respectiveSet.head.right;
    respectiveSet.cache_line.delete(nodeToBeDel.tag);
    newNode.left = respectiveSet.tail;
    respectiveSet.tail.right = newNode;
    respectiveSet.tail = newNode;
    respectiveSet.cache_line.set(tagValue, newNode);
    return {
      node: newNode,
      cost: CACHE_DATA_L2.accessLatency + CACHE_DATA_L1.memoryAccessTime, //assuming 5 is penalty
    };
  } else {
    //load
    let block = [];
    for (let i = 0; i < CACHE_DATA_L2.blockSize; i++) {
      block[i] = memory[tagValue + i];
    }
    //respectiveSet.cache_line.set(tagValue, block);

    if (respectiveSet.head == null) {
      let newNode = new Node(block, tagValue);
      respectiveSet.cache_line.set(tagValue, newNode);
      respectiveSet.head = newNode;
      respectiveSet.tail = newNode;
      return {
        node: newNode,
        cost: CACHE_DATA_L2.accessLatency + CACHE_DATA_L1.memoryAccessTime, //assuming 5 is penalty
      };
    } else {
      let newNode = new Node(block, tagValue);
      respectiveSet.cache_line.set(tagValue, newNode);
      respectiveSet.tail.right = newNode;
      newNode.left = respectiveSet.tail;
      respectiveSet.tail = newNode;
      return {
        node: newNode,
        cost: CACHE_DATA_L2.accessLatency + CACHE_DATA_L1.memoryAccessTime, //assuming 5 is penalty
      };
    }
  }
};

let storeDataInCacheL2 = (address, value) => {
  CACHE_DATA_L2.calls++;
  let oldLength = address.length;
  for (let i = 0; i < 32 - oldLength; i++) {
    address = "0" + address;
  }

  let tagBitsOfAddress = address.slice(0, CACHE_DATA_L2.tagBits);
  let tagValue = parseInt(tagBitsOfAddress, 2); //decimal value of tag
  let indexBitsOfAddress = address.slice(
    CACHE_DATA_L2.tagBits,
    CACHE_DATA_L2.indexBits + CACHE_DATA_L2.tagBits
  );
  let indexValue = parseInt(indexBitsOfAddress, 2);
  let offsetBitsOfAddress = address.slice(
    CACHE_DATA_L2.tagBits + CACHE_DATA_L2.indexBits,
    address.length
  );
  let offsetValue = parseInt(offsetBitsOfAddress, 2);
  console.log(tagBitsOfAddress, indexBitsOfAddress, offsetBitsOfAddress);

  let respectiveSet = CACHE_L2[indexValue];

  if (respectiveSet.cache_line.has(tagValue)) {
    CACHE_DATA_L2.hits++;
    //CACHE HIT
    console.log("CACHE HIT");
    [respectiveSet.head, respectiveSet.tail] = rearrangeSet(
      respectiveSet.head,
      respectiveSet.tail,
      respectiveSet.cache_line.get(tagValue)
    );

    let numberOfBytes = value.length;
    let cost = CACHE_DATA_L2.accessLatency;
    for (let j = 0; j < numberOfBytes; j++) {
      if (offsetValue + j >= 64) {
        let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

        for (let k = 0; k < CACHE_DATA_L2.offsetBits; k++) {
          newAddress += "0";
        }
        let extraCost = storeDataInCacheL1(
          newAddress,
          value.slice(j, numberOfBytes)
        );

        cost += extraCost;
        break;
      }
      respectiveSet.cache_line.get(tagValue).block[offsetValue + j] = value[j];
    }

    //respectiveSet.cache_line.get(tagValue).block[offsetValue] = value;
    respectiveSet.cache_line.get(tagValue).isDirty = true;
    return {
      node: respectiveSet.cache_line.get(tagValue),
      cost,
    };
  }
  CACHE_DATA_L2.misses++;

  let cost = CACHE_DATA_L2.accessLatency + CACHE_DATA_L1.memoryAccessTime; //penalty
  //memory[parseInt(address, 2)] = value;

  if (respectiveSet.cache_line.size === CACHE_DATA_L2.associativity) {
    //evict

    //writing to memory
    if (respectiveSet.head.isDirty === true) {
      for (let i = 0; i < CACHE_DATA_L2.blockSize; i++) {
        memory[parseInt(head.tag + indexBitsOfAddress, 2) + i] =
          respectiveSet.head.block[i];
      }
    }

    console.log("Eviction l2s", tagValue);

    let block = [];
    for (let i = 0; i < CACHE_DATA_L2.blockSize; i++) {
      block[i] = memory[tagValue + i];
    }
    let newNode = new Node(block, tagValue);
    let nodeToBeDel = respectiveSet.head;
    respectiveSet.head.left = null;
    respectiveSet.head = respectiveSet.head.right;

    respectiveSet.cache_line.delete(nodeToBeDel.tag);
    newNode.left = respectiveSet.tail;
    respectiveSet.tail.right = newNode;
    respectiveSet.tail = newNode;

    let numberOfBytes = value.length;

    for (let j = 0; j < numberOfBytes; j++) {
      if (offsetValue + j >= 64) {
        let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

        for (let k = 0; k < CACHE_DATA_L2.offsetBits; k++) {
          newAddress += "0";
        }
        let extraCost = storeDataInCacheL1(
          newAddress,
          value.slice(j, numberOfBytes)
        );

        cost += extraCost;
        break;
      }
      newNode.block[offsetValue + j] = value[j];
    }

    //respectiveSet.cache_line.get(tagValue).block[offsetValue] = value;
    newNode.isDirty = true;
    respectiveSet.cache_line.set(tagValue, newNode);
    return {
      node: newNode,
      cost,
    };
  } else {
    //load
    let block = [];
    for (let i = 0; i < CACHE_DATA_L2.blockSize; i++) {
      block[i] = memory[tagValue + i];
    }

    //respectiveSet.cache_line.set(tagValue, block);

    if (respectiveSet.head == null) {
      let newNode = new Node(block, tagValue);
      respectiveSet.cache_line.set(tagValue, newNode);
      respectiveSet.head = newNode;
      respectiveSet.tail = newNode;
      let numberOfBytes = value.length;

      for (let j = 0; j < numberOfBytes; j++) {
        if (offsetValue + j >= 64) {
          let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

          for (let k = 0; k < CACHE_DATA_L2.offsetBits; k++) {
            newAddress += "0";
          }
          let extraCost = storeDataInCacheL1(
            newAddress,
            value.slice(j, numberOfBytes)
          );

          cost += extraCost;
          break;
        }
        newNode.block[offsetValue + j] = value[j];
      }

      //respectiveSet.cache_line.get(tagValue).block[offsetValue] = value;
      newNode.isDirty = true;
      respectiveSet.cache_line.set(tagValue, newNode);
      return {
        node: newNode,
        cost,
      };
    } else {
      let newNode = new Node(block, tagValue);
      respectiveSet.cache_line.set(tagValue, newNode);
      respectiveSet.tail.right = newNode;
      newNode.left = respectiveSet.tail;
      respectiveSet.tail = newNode;
      let numberOfBytes = value.length;

      for (let j = 0; j < numberOfBytes; j++) {
        if (offsetValue + j >= 64) {
          let newAddress = tagBitsOfAddress + (indexValue + 1).toString(2);

          for (let k = 0; k < CACHE_DATA_L2.offsetBits; k++) {
            newAddress += "0";
          }
          let extraCost = storeDataInCacheL1(
            newAddress,
            value.slice(j, numberOfBytes)
          );

          cost += extraCost;
          break;
        }
        newNode.block[offsetValue + j] = value[j];
      }

      //respectiveSet.cache_line.get(tagValue).block[offsetValue] = value;
      newNode.isDirty = true;
      respectiveSet.cache_line.set(tagValue, newNode);
      return {
        node: newNode,
        cost,
      };
    }
  }
};

// console.log(getDataFromCacheL1((16).toString(2), 4));
// //console.log(getDataFromCacheL1((64).toString(2), 4));
// //console.log(getDataFromCacheL1((16).toString(2), 4));
// console.log(storeDataInCacheL1((62).toString(2), [17, 18, 19, 20]));
// console.log(getDataFromCacheL1((62).toString(2), 4));

// console.log(CACHE_DATA_L1, CACHE_DATA_L2);

//console.log(storeDataInCacheL1((8192 * 8).toString(2), "heya"));
// console.log(getDataFromCacheL1((8192 * 8).toString(2)));
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
  latch: {
    ForwardedData: {
      ExResult: null,
      MemResult: null,
      WbResult: null,
    },
  },
};
let MEM_UNIT = {
  locked: false,
  latch: null,
};
let WB_UNIT = {
  locked: false,
  latch: null,
};

// let ALU_UNIT = [];
// let temp_MEM_UNIT = []; //memoryWrite writes the result to this array. At the end of each cycle we add this result to ALU_UNIT. This prevents memory writes to the ALU_UNIT during the same cycle.

timelineButton.onclick = () => {
  let submitButton = document.getElementById("cycleDataSubmit");
  submitButton.click();
};
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

function CheckForwardedData(register) {
  //Data forwarded from EX: HIGH PRIORITY
  if (EX_UNIT.latch.ForwardedData.ExResult) {
    if (Object.keys(EX_UNIT.latch.ForwardedData.ExResult)[0] == register) {
      return EX_UNIT.latch.ForwardedData.ExResult[register];
    }
  }

  //Not Found in EX
  if (EX_UNIT.latch.ForwardedData.MemResult) {
    console.log(Object.keys(EX_UNIT.latch.ForwardedData.MemResult));
    if (Object.keys(EX_UNIT.latch.ForwardedData.MemResult)[0] == register) {
      return EX_UNIT.latch.ForwardedData.MemResult[register];
    }
  }
  //Not Found in MEM

  if (EX_UNIT.latch.ForwardedData.WbResult) {
    if (Object.keys(EX_UNIT.latch.ForwardedData.WbResult)[0] == register) {
      return EX_UNIT.latch.ForwardedData.WbResult[register];
    }
  }

  return null;
}

function add(data) {
  let operand_1 = data.operand1;
  let operand_2 = data.operand2;

  if (operand_1.isDirty) {
    let returnVal = CheckForwardedData(data.r1);
    if (returnVal != null) {
      operand_1.value = returnVal;
    } else {
      return "stall";
    }
  }

  if (operand_2.isDirty) {
    let returnVal = CheckForwardedData(data.r2);
    if (returnVal != null) {
      operand_2.value = returnVal;
    } else {
      return "stall";
    }
  }

  let sum = operand_1.value + operand_2.value;
  EX_UNIT.latch = {
    ForwardedData: EX_UNIT.latch.ForwardedData,
    ...ID_UNIT.latch,
    WriteBackValue: sum,
  };

  let result = {};
  result[data.rd] = sum;

  return result;

  //registers = registers.set(rd, sum);
  // console.log(registers)
  //displayRegisters();
}

function addi(data, cycle) {
  // console.log("DATA", data);
  // console.log(EX_UNIT.latch.ForwardedData);
  let operand_1 = data.operand1;

  if (operand_1.isDirty) {
    let returnVal = CheckForwardedData(data.r1);
    if (returnVal != null) {
      operand_1.value = returnVal;
    } else {
      return "stall";
    }
  }
  //console.log(operand_1.value);
  let sum = operand_1.value + data.immediate;
  //console.log("SUM", sum);
  EX_UNIT.latch = {
    ForwardedData: EX_UNIT.latch.ForwardedData,
    ...ID_UNIT.latch,
    WriteBackValue: sum,
  };
  let rd = data.rd;

  let result = {};
  result[data.rd] = sum;

  return result;

  //registers = registers.set(rd, sum);
  // console.log(registers)
  //displayRegisters();
}

function sll(data) {
  //console.log(EX_UNIT.latch.ForwardedData);
  let operand_1 = data.operand1;
  if (operand_1.isDirty) {
    let returnVal = CheckForwardedData(data.r1);
    if (returnVal != null) {
      operand_1.value = returnVal;
    } else {
      return "stall";
    }
  }
  let shiftedNum = operand_1.value << parseInt(data.immediate);
  EX_UNIT.latch = {
    ForwardedData: EX_UNIT.latch.ForwardedData,
    ...ID_UNIT.latch,
    WriteBackValue: shiftedNum,
  };
  // console.log(operand1, parseInt(decimal));
  //registers = registers.set(rd, shiftedNum);
  // console.log(registers)
  //displayRegisters();
  let result = {};
  result[data.rd] = shiftedNum;
  return result;
}

function sub(data) {
  let operand_1 = data.operand1;
  let operand_2 = data.operand2;
  if (operand_1.isDirty) {
    let returnVal = CheckForwardedData(data.r1);
    if (returnVal != null) {
      operand_1.value = returnVal;
    } else {
      return "stall";
    }
  }

  if (operand_2.isDirty) {
    let returnVal = CheckForwardedData(data.r2);
    if (returnVal != null) {
      operand_2.value = returnVal;
    } else {
      return "stall";
    }
  }
  let diff = operand_1.value - operand_2.value;
  EX_UNIT.latch = {
    ForwardedData: EX_UNIT.latch.ForwardedData,
    ...ID_UNIT.latch,
    WriteBackValue: diff,
  };

  let result = {};
  result[data.rd] = diff;

  return result;
  // registers = registers.set(rd, diff);
  // displayRegisters();
}
function slt(data) {
  //console.log(EX_UNIT.latch.ForwardedData);
  let operand_1 = data.operand1;
  let operand_2 = data.operand2;
  //console.log(data);
  if (operand_1.isDirty) {
    let returnVal = CheckForwardedData(data.r1);
    //console.log(returnVal);
    if (returnVal != null) {
      //console.log("No stall");
      operand_1.value = returnVal;
    } else {
      return "stall";
    }
  }

  if (operand_2.isDirty) {
    //console.log("Why am i here");
    let returnVal = CheckForwardedData(data.r2);
    if (returnVal != null) {
      operand_2.value = returnVal;
    } else {
      return "stall";
    }
  }
  let value = 0;
  if (operand_1.value < operand_2.value) {
    value = 1;
  }
  EX_UNIT.latch = {
    ForwardedData: EX_UNIT.latch.ForwardedData,
    ...ID_UNIT.latch,
    WriteBackValue: value,
  };
  let result = {};
  result[data.rd] = value;
  return result;
}

function lw(data) {
  let operand_1 = data.operand1;

  if (operand_1.isDirty) {
    let returnVal = CheckForwardedData(data.r1);
    if (returnVal != null) {
      operand_1.value = returnVal;
    } else {
      return "stall";
    }
  }

  let finalAddress = operand_1.value + data.immediate * 4;

  EX_UNIT.latch = {
    ForwardedData: EX_UNIT.latch.ForwardedData,
    ...ID_UNIT.latch,
    loadAddress: finalAddress,
  };
  let print = { ...EX_UNIT.latch };
  //console.log(print);

  // console.log(finalAddress);
  // console.log(memory);

  //registers.set(rd, decimalValue);
  //displayRegisters();
  // let r1 = ins[2][1] + ins[2][2]
  return null;
}

function sw(data, memoryIndex) {
  let operand_1 = data.operand1;

  if (operand_1.isDirty) {
    let returnVal = CheckForwardedData(data.r1);
    if (returnVal != null) {
      operand_1.value = returnVal;
    } else {
      return "stall";
    }
  }
  let finalAddress = operand_1.value + data.immediate * 4;
  EX_UNIT.latch = {
    ForwardedData: EX_UNIT.latch.ForwardedData,
    ...ID_UNIT.latch,
    storeAddress: finalAddress,
  };
  return null;
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

    let r1 = instructionToBeDecoded[2][1] + instructionToBeDecoded[2][2];
    let r2 = instructionToBeDecoded[3][1] + instructionToBeDecoded[3][2];
    let operand1 = registers.get(r1);
    let operand2 = registers.get(r2);

    registers.set(rd, { value: rdVal, isBeingWritten: true });
    ID_UNIT.latch = {
      instructionToBeDecoded,
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
    registers.set(rd, { value: rdVal, isBeingWritten: true });
    //console.log(operand1, operand1Value);
    ID_UNIT.latch = {
      instructionType,
      rd,
      r1,
      immediate,
      operand1: operand1Value,
    };
    //console.log(ID_UNIT.latch);
    return null;
  }

  if (instructionType === "sw" || instructionType === "lw") {
    let rd = instructionToBeDecoded[1][1] + instructionToBeDecoded[1][2];
    console.log(rd);
    let rdVal = registers.get(rd).value;
    if (instructionType === "lw") {
      registers.set(rd, { value: rdVal, isBeingWritten: true });
    }
    if (instructionType === "sw") {
      let operand1Value = {
        value: rdVal,
        isDirty: registers.get(rd).isBeingWritten,
      };
      rdVal = operand1Value;
      //console.log(operand1Value.value);
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
      rdVal,
      operand1: { value: operand1.value, isDirty: operand1.isBeingWritten },
    };
    return null;
  }
  if (instructionType == "j") {
    // console.log("JUMPPP", jumpPositions);
    // console.log(jumpPositions.get(instructionToBeDecoded[1]));
    return jumpPositions.get(instructionToBeDecoded[1]);
  }
  if (instructionType == "beq") {
    let r1 = instructionToBeDecoded[1][1] + instructionToBeDecoded[1][2];
    let r2 = instructionToBeDecoded[2][1] + instructionToBeDecoded[2][2];

    let r1Value = registers.get(r1);
    let r2Value = registers.get(r2);
    //console.log("From BEQ", EX_UNIT.latch.ForwardedData);
    if (r1Value.isBeingWritten) {
      let stall = true;

      //Data forwarded from EX: HIGH PRIORITY
      if (EX_UNIT.latch.ForwardedData.ExResult) {
        if (Object.keys(EX_UNIT.latch.ForwardedData.ExResult)[0] == r1) {
          r1Value.value = EX_UNIT.latch.ForwardedData.ExResult[r1];
          stall = false;
        }
      }

      if (stall) {
        //still stall is true. Search in MEM
        if (EX_UNIT.latch.ForwardedData.MemResult) {
          //console.log(Object.keys(EX_UNIT.latch.ForwardedData.MemResult));
          if (Object.keys(EX_UNIT.latch.ForwardedData.MemResult)[0] == r1) {
            r1Value.value = EX_UNIT.latch.ForwardedData.MemResult[r1];
            stall = false;
          }
        }
      }
      if (stall) {
        if (EX_UNIT.latch.ForwardedData.WbResult) {
          if (Object.keys(EX_UNIT.latch.ForwardedData.WbResult)[0] == r1) {
            r1Value.value = EX_UNIT.latch.ForwardedData.WbResult[r1];
            stall = false;
          }
        }
      }

      if (stall) return "stall";
      if (stall) {
        console.log("Stall");
      }
    }

    if (r2Value.isBeingWritten) {
      let stall = true;

      //Data forwarded from EX: HIGH PRIORITY
      if (EX_UNIT.latch.ForwardedData.ExResult) {
        if (Object.keys(EX_UNIT.latch.ForwardedData.ExResult)[0] == r2) {
          r2Value.value = EX_UNIT.latch.ForwardedData.ExResult[r2];
          stall = false;
        }
      }

      if (stall) {
        //still stall is true. Search in MEM
        if (EX_UNIT.latch.ForwardedData.MemResult) {
          //console.log(Object.keys(EX_UNIT.latch.ForwardedData.MemResult));
          if (Object.keys(EX_UNIT.latch.ForwardedData.MemResult)[0] == r2) {
            r2Value.value = EX_UNIT.latch.ForwardedData.MemResult[r2];
            stall = false;
          }
        }
      }
      if (stall) {
        if (EX_UNIT.latch.ForwardedData.WbResult) {
          if (Object.keys(EX_UNIT.latch.ForwardedData.WbResult)[0] == r2) {
            r2Value.value = EX_UNIT.latch.ForwardedData.WbResult[r2];
            stall = false;
          }
        }
      }

      if (stall) return "stall";
      if (stall) {
        console.log("Stall");
      }
    }

    if (r1Value.value == r2Value.value) {
      return jumpPositions.get(instructionToBeDecoded[3]);
    } else {
      return -1; //-1 means no branch taken
    }
  }
}

function Execute(cycle) {
  // let currentInstruction = ID_UNIT.latch.instructionToBeDecoded;
  // console.log(ID_UNIT.latch.instructionType);
  // console.log("From Execute", ID_UNIT.latch.operand1);
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
    //console.log("WEBhbfds");
    returnValue = slt(ID_UNIT.latch);
  } else if (ID_UNIT.latch.instructionType == "sll") {
    returnValue = sll(ID_UNIT.latch);
  }
  return returnValue;
}

function MemoryWrite(memoryIndex, cycle) {
  if (EX_UNIT.latch.instructionType === "lw") {
    let BinaryEquivalent = "";
    //console.log(EX_UNIT.latch.loadAddress);
    // BinaryEquivalent =
    //   memory[EX_UNIT.latch.loadAddress] +
    //   memory[EX_UNIT.latch.loadAddress + 1] +
    //   memory[EX_UNIT.latch.loadAddress + 2] +
    //   memory[EX_UNIT.latch.loadAddress + 3];

    let CacheResponse = getDataFromCacheL1(
      EX_UNIT.latch.loadAddress.toString(2),
      4
    );
    BinaryEquivalent = CacheResponse.value.join("");

    //console.log(BinaryEquivalent);
    //console.log(parseInt(BinaryEquivalent.slice(1, 32), 2), Math.pow(2 * parseInt(BinaryEquivalent[0]), 31))
    let decimalValue =
      parseInt(BinaryEquivalent.slice(1, 32), 2) -
      Math.pow(2 * parseInt(BinaryEquivalent[0]), 31); // Using 2s complement property
    //console.log(decimalValue);
    MEM_UNIT.latch = {
      ...EX_UNIT.latch,
      WriteBackValue: decimalValue,
    };
    let result = {};
    result[EX_UNIT.latch.rd] = decimalValue;
    // temp_MEM_UNIT.slice(0);
    // temp_MEM_UNIT.push(result);
    // console.log(temp_MEM_UNIT);
    //console.log(decimalValue)
    return { data: result, cost: CacheResponse.cost - 1, stall: false };
  } else if (EX_UNIT.latch.instructionType === "sw") {
    let numberToBeStored = EX_UNIT.latch.rdVal;

    if (numberToBeStored.isDirty) {
      let returnVal = CheckForwardedData(EX_UNIT.latch.rd);
      if (returnVal === "stall") {
        return { data: null, cost: 0, stall: true };
      } else {
        numberToBeStored.value = returnVal;
      }
    }
    //console.log("STORRIIIIIIIIINGGG", numberToBeStored);
    let BinaryEquivalent = (numberToBeStored.value >>> 0).toString(2);

    let initialLength = BinaryEquivalent.length;
    for (let j = 0; j < 32 - initialLength; j += 1) {
      BinaryEquivalent = "0" + BinaryEquivalent;
    }
    //console.log("Store Address", EX_UNIT.latch.storeAddress);
    let word_store = [];
    word_store.push(BinaryEquivalent.slice(0, 8));
    word_store.push(BinaryEquivalent.slice(8, 16));
    word_store.push(BinaryEquivalent.slice(16, 24));
    word_store.push(BinaryEquivalent.slice(24, 32));

    let cost = storeDataInCacheL1(
      EX_UNIT.latch.storeAddress.toString(2),
      word_store
    );

    memory[EX_UNIT.latch.storeAddress] = BinaryEquivalent.slice(0, 8);
    memory[EX_UNIT.latch.storeAddress + 1] = BinaryEquivalent.slice(8, 16);
    memory[EX_UNIT.latch.storeAddress + 2] = BinaryEquivalent.slice(16, 24);
    memory[EX_UNIT.latch.storeAddress + 3] = BinaryEquivalent.slice(24, 32);
    console.log("Look here", [...memory]);
    if (EX_UNIT.latch.storeAddress >= memoryIndex) {
      wordAddresses.push(EX_UNIT.latch.storeAddress);
      //console.log(EX_UNIT.latch.storeAddress);
    }

    MEM_UNIT.latch = {
      ...EX_UNIT.latch,
      WriteBackValue: null,
    };
    return { data: null, cost: cost - 1, stall: 0 };
  } else {
    MEM_UNIT.latch = {
      ...EX_UNIT.latch,
    };
    let result = {};
    result[EX_UNIT.latch.rd] = EX_UNIT.latch.WriteBackValue;
    return { data: result, stall: false, cost: 0 };
  }
}

function WriteBack(memoryIndex) {
  // console.log("MEMUNIT", MEM_UNIT);

  let setValue = {
    value: MEM_UNIT.latch.WriteBackValue,
    isBeingWritten: false,
  };
  if (MEM_UNIT.latch.WriteBackValue != null) {
    registers.set(MEM_UNIT.latch.rd, setValue);
  }
  // console.log(
  //   MEM_UNIT.latch.rd,
  //   registers.get(MEM_UNIT.latch.rd).isBeingWritten
  // );
  let result = {};
  result[MEM_UNIT.latch.rd] = MEM_UNIT.latch.WriteBackValue;
  return result;
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
      memory[wordAddresses[i]] +
      "  " +
      memory[wordAddresses[i] + 1] +
      " " +
      memory[wordAddresses[i] + 2] +
      " " +
      memory[wordAddresses[i] + 3] +
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
  console.log("Look here", [...memory]);

  displayMemory(memoryIndex);

  let nextInstructionIndex = jumpPositions.get("main");
  let InstructionQueue = [];
  let cycle = 0;
  let NumberOfStalls = 0;
  let TotalInstructionsExecuted = 0;

  let temp = new Job();
  temp.currentStage = 0;
  temp.instruction = splitted[nextInstructionIndex];
  InstructionQueue.push(temp);
  let cycleData = [];
  let cyclesLeftForMEM = 0;
  while (InstructionQueue.length != 0) {
    let jobsDoneInCurrentCycle = [];
    let resultFromEx = null;
    let resultFromMem = null;
    let resultFromWb = null;

    cycle++;
    let currentJobs = InstructionQueue.length;
    let stall = false;

    for (let i = 0; i < currentJobs; i++) {
      let currentJob = InstructionQueue[0];
      if (!stall) {
        switch (currentJob.currentStage) {
          case 0: {
            console.log("IF");
            if (!IF_UNIT.locked) {
              //console.log("NEW INS FETCHED", splitted[nextInstructionIndex]);
              IF_UNIT.locked = true;
              currentJob.instruction = InstructionFetch(
                nextInstructionIndex,
                splitted
              );

              let jobData = {
                stage: "IF",
                instruction: currentJob.instruction,
              };
              jobsDoneInCurrentCycle.push(jobData);

              nextInstructionIndex++;
              IF_UNIT.latch = currentJob.instruction;
              currentJob.currentStage++;
              InstructionQueue.shift(); //removes the first element in the array
              InstructionQueue.push(currentJob);
            } else {
              stall = true;
              let jobData = {
                stage: "STL",
                instruction: currentJob.instruction,
              };
              jobsDoneInCurrentCycle.push(jobData);
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
              //console.log("ID Return value ", newPC);
              if (newPC != null) {
                if (newPC === "stall") {
                  stall = true;

                  //InstructionQueue.shift();
                  InstructionQueue.push(currentJob);
                } else if (newPC != -1) {
                  console.log("I was here");

                  nextInstructionIndex = newPC;
                  //for beq and jump
                }
                if (!stall) {
                  let jobData = {
                    stage: "ID/RF",
                    instruction: currentJob.instruction,
                  };
                  jobsDoneInCurrentCycle.push(jobData);
                  TotalInstructionsExecuted++;
                }
                stall = true;
                let jobData = {
                  stage: "STL",
                  instruction: currentJob.instruction,
                };
                jobsDoneInCurrentCycle.push(jobData);
              } else {
                let jobData = {
                  stage: "ID/RF",
                  instruction: currentJob.instruction,
                };
                jobsDoneInCurrentCycle.push(jobData);
                currentJob.currentStage++;
                InstructionQueue.push(currentJob);
              }
              InstructionQueue.shift(); //removes the first element in the array
            } else {
              stall = true;
              let jobData = {
                stage: "STL",
                instruction: currentJob.instruction,
              };
              jobsDoneInCurrentCycle.push(jobData);
              InstructionQueue.shift();
              InstructionQueue.push(currentJob);
            }

            break;
          }
          case 2: {
            //execution
            // console.log(ID_UNIT.latch.operand1);
            console.log("EX");
            if (!EX_UNIT.locked) {
              EX_UNIT.locked = true;

              let returnVal = Execute(cycle);
              if (returnVal === "stall") {
                stall = true;
                let jobData = {
                  stage: "STL",
                  instruction: currentJob.instruction,
                };
                jobsDoneInCurrentCycle.push(jobData);
                InstructionQueue.shift();
                InstructionQueue.push(currentJob);
              } else {
                if (returnVal) {
                  resultFromEx = returnVal;
                }
                let jobData = {
                  stage: "EX",
                  instruction: currentJob.instruction,
                };
                jobsDoneInCurrentCycle.push(jobData);
                currentJob.currentStage++;
                InstructionQueue.push(currentJob);
                InstructionQueue.shift(); //removes the first element in the array
              }
            } else {
              let jobData = {
                stage: "STL",
                instruction: currentJob.instruction,
              };
              jobsDoneInCurrentCycle.push(jobData);
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

              if (cyclesLeftForMEM == 0) {
                let returnVal = MemoryWrite(memoryIndex, cycle);
                if (returnVal.stall === true) {
                  stall = true;

                  let jobData = {
                    stage: "STL",
                    instruction: currentJob.instruction,
                  };
                  jobsDoneInCurrentCycle.push(jobData);
                  InstructionQueue.shift();
                  InstructionQueue.push(currentJob);
                } else {
                  cyclesLeftForMEM = returnVal.cost;
                  let jobData = {
                    stage: "MEM",
                    instruction: currentJob.instruction,
                  };
                  jobsDoneInCurrentCycle.push(jobData);
                  if (returnVal.data != null) {
                    resultFromMem = returnVal.data;
                  }
                  if (cyclesLeftForMEM === 0) {
                    currentJob.currentStage++;
                    InstructionQueue.push(currentJob);
                    InstructionQueue.shift();
                  } else {
                    InstructionQueue.push(currentJob);
                    InstructionQueue.shift();
                  }
                }
              } else {
                cyclesLeftForMEM--;
                let jobData = {
                  stage: "MEM",
                  instruction: currentJob.instruction,
                };
                jobsDoneInCurrentCycle.push(jobData);
                if (cyclesLeftForMEM == 0) {
                  currentJob.currentStage++;
                  InstructionQueue.push(currentJob);
                  InstructionQueue.shift();
                } else {
                  InstructionQueue.push(currentJob);
                  InstructionQueue.shift();
                }
              }
            } else {
              stall = true;
              let jobData = {
                stage: "STL",
                instruction: currentJob.instruction,
              };
              jobsDoneInCurrentCycle.push(jobData);
              InstructionQueue.shift();
              InstructionQueue.push(currentJob);
            }
            break;
          }
          case 4: {
            //WB
            console.log("WB");
            if (!WB_UNIT.locked) {
              WB_UNIT.locked = true;
              console.log(MEM_UNIT);
              let jobData = {
                stage: "WB",
                instruction: currentJob.instruction,
              };
              jobsDoneInCurrentCycle.push(jobData);
              resultFromWb = WriteBack(memoryIndex);
              InstructionQueue.shift(); //removes the first element in the array
              TotalInstructionsExecuted++;
            } else {
              stall = true;
              let jobData = {
                stage: "STL",
                instruction: currentJob.instruction,
              };
              jobsDoneInCurrentCycle.push(jobData);
              InstructionQueue.shift();
              InstructionQueue.push(currentJob);
            }
            break;
          }
        }
      } else {
        InstructionQueue.shift();
        if (currentJob.currentStage === 0) {
          if (nextInstructionIndex < splitted.length) {
            let nextInstruction = new Job();
            nextInstruction.currentStage = 0;
            nextInstruction.instruction = splitted[nextInstructionIndex];
            console.log(nextInstruction);
            InstructionQueue.push(nextInstruction);
          }
        } else {
          InstructionQueue.push(currentJob);
        }
      }
      // if (tem)
      //ALU_UNIT.push(temp_MEM_UNIT);
    }
    console.log(stall);
    let rt = [...InstructionQueue];
    //console.log("Start", rt);
    if (stall === true) {
      NumberOfStalls++;
    } else if (stall === false) {
      // console.log(nextInstructionIndex);
      // console.log(cycle);
      //We fetch new instruction only when old instruction was fetched and there's no stall
      if (nextInstructionIndex < splitted.length) {
        //add next instruction only if its available
        let nextInstruction = new Job();
        nextInstruction.currentStage = 0;
        nextInstruction.instruction = splitted[nextInstructionIndex];
        //console.log(nextInstruction);
        InstructionQueue.push(nextInstruction);
      }
    }
    if (resultFromEx != null) {
      EX_UNIT.latch.ForwardedData.ExResult = resultFromEx;
    }
    if (resultFromMem != null)
      EX_UNIT.latch.ForwardedData.MemResult = resultFromMem;
    if (resultFromWb != null)
      EX_UNIT.latch.ForwardedData.WbResult = resultFromWb;
    unlockUnits();
    rt = [...InstructionQueue];
    //console.log("end", rt);

    cycleData.push(jobsDoneInCurrentCycle);
  }

  displayMemory(memoryIndex);
  displayRegisters();
  console.log("cycles", cycle);
  console.log("Stalls", NumberOfStalls);
  // console.log(registers);
  // console.log(cycleData);
  let cycleDataString = JSON.stringify(cycleData);
  console.log(TotalInstructionsExecuted);

  let cycleDataInput = document.getElementById("cycle-data");
  let cycleInput = document.getElementById("numberOfCycles");
  let stallInput = document.getElementById("numberOfStalls");
  let instructionLength = document.getElementById("numberOfInstructions");

  cycleDataInput.value = cycleDataString;
  //console.log(cycleDataInput.value);
  cycleInput.value = cycle;
  stallInput.value = NumberOfStalls;
  instructionLength.value = TotalInstructionsExecuted;

  let cyclesDiv = document.getElementById("cycles");
  let iconEl = document.createElement("i");
  iconEl.classList.add("sync");
  iconEl.classList.add("alternate");
  iconEl.classList.add("icon");
  iconEl.classList.add("cyclesIcon");
  cyclesDiv.appendChild(iconEl);
  cyclesDiv.innerHTML +=
    "CPI: " + (cycle / TotalInstructionsExecuted).toFixed(2);

  let miss_rate_l1 = document.getElementById("CacheL1MissRate");
  miss_rate_l1.innerHTML =
    (
      (CACHE_DATA_L1.misses * 100) /
      (CACHE_DATA_L1.calls !== 0 ? CACHE_DATA_L1.calls : 1)
    ).toFixed(2) + " %";

  let miss_rate_l2 = document.getElementById("CacheL2MissRate");
  miss_rate_l2.innerHTML =
    (
      (CACHE_DATA_L2.misses * 100) /
      (CACHE_DATA_L2.calls !== 0 ? CACHE_DATA_L2.calls : 1)
    ).toFixed(2) + " %";
  let cacheDiv = document.getElementById("CacheMissRate");
  cacheDiv.style.display = "block";

  let stallDiv = document.getElementById("stalls");
  let iconEl2 = document.createElement("i");
  iconEl2.classList.add("ban");
  iconEl2.classList.add("icon");
  iconEl2.classList.add("banIcon");
  stallDiv.appendChild(iconEl2);
  stallDiv.innerHTML += "Stalls: " + NumberOfStalls;

  timelineButton.style.display = "block";
};
