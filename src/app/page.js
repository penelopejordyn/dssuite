"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LinkedListVisualization = ({ listState }) => {
  const { nodes, head, tail, error } = listState;
  
  if (!nodes || nodes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Empty List
      </div>
    );
  }

  return (
    <div className="my-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-2 overflow-x-auto py-8">
        {nodes.map((node, index) => (
          <React.Fragment key={index}>
            <div className="relative flex flex-col items-center min-w-[100px]">
              {head === index && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="px-2 py-1 bg-blue-500 text-white text-sm rounded">
                    head
                  </div>
                  <div className="h-2 w-0.5 bg-blue-500 mx-auto" />
                </div>
              )}
              
              <div className={`
                w-16 h-16 rounded-lg border-2 flex items-center justify-center
                ${(head === index && tail === index && nodes.length > 1) ? 'border-red-500' : 'border-blue-500'}
              `}>
                {node.val}
              </div>
              
              <div className="text-xs mt-1">
                next: {node.next === null ? 'null' : node.next}
              </div>
              
              {tail === index && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="h-2 w-0.5 bg-green-500 mx-auto" />
                  <div className="px-2 py-1 bg-green-500 text-white text-sm rounded">
                    tail
                  </div>
                </div>
              )}
            </div>
            
            {index < nodes.length - 1 && (
              <div className="flex-shrink-0 w-8 h-0.5 bg-blue-500 relative top-[32px]">
                <div className="absolute -right-2 -top-1 w-2 h-2 border-t-2 border-r-2 border-blue-500 rotate-45" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {error && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

const TestResult = ({ result }) => {
  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <div className={`p-4 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
        <Alert variant={result.passed ? 'default' : 'destructive'}>
          {result.passed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {result.name}: {result.passed ? 'Passed' : result.error || 'Failed'}
          </AlertDescription>
        </Alert>
      </div>
      
      {result.listState && (
        <div className="border-t">
          <div className="p-2 bg-slate-50 text-sm font-medium">
            List State After Test:
          </div>
          <LinkedListVisualization listState={result.listState} />
        </div>
      )}
    </div>
  );
};

const captureListState = (list) => {
  try {
    const nodes = [];
    let current = list.head;
    let index = 0;
    const nodeIndices = new Map();
    
    while (current && index < 20) {
      nodeIndices.set(current, index);
      nodes.push({
        val: current.val,
        next: null
      });
      current = current.next;
      index++;
    }
    
    current = list.head;
    index = 0;
    while (current && index < nodes.length) {
      if (current.next) {
        nodes[index].next = nodeIndices.get(current.next);
      }
      current = current.next;
      index++;
    }
    
    const headIndex = nodeIndices.get(list.head);
    const tailIndex = nodeIndices.get(list.tail);
    
    let error = null;
    if (nodes.length > 1 && headIndex === tailIndex) {
      error = "Head and tail are pointing to the same node in a multi-node list";
    }
    if (nodes.length > 0 && !list.tail) {
      error = "Tail is null but list contains nodes";
    }
    if (list.tail && list.tail.next !== null) {
      error = "Tail's next pointer is not null";
    }
    
    return {
      nodes,
      head: headIndex,
      tail: tailIndex,
      length: list.length,
      error
    };
  } catch (error) {
    return {
      nodes: [],
      head: null,
      tail: null,
      length: 0,
      error: `Failed to capture list state: ${error.message}`
    };
  }
};

const LinkedListLearning = () => {
  const [activeMethod, setActiveMethod] = useState('push');
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);

  const getBaseCode = (activeMethod) => {
    let code = `
      class Node {
        constructor(val) {
          this.val = val;
          this.next = null;
        }
      }
  
      class LinkedList {
        constructor() {
          this.head = null;
          this.tail = null;
          this.length = 0;
        }
    `;
  
    // Add required helper methods based on which tab is active
    if (activeMethod === 'pop' || activeMethod === 'shift' || activeMethod === 'unshift' || activeMethod === 'get' || activeMethod === 'remove' || activeMethod === 'set' || activeMethod === 'reverse') {
      code += `
        push(val) {
          const newNode = new Node(val);
          if (!this.head) {
              this.head = newNode;
              this.tail = newNode;
          } else {
              this.tail.next = newNode;
              this.tail = newNode;
          }
          this.length++;
          return this;
        }
      `;
    }
  
    if (activeMethod === 'set' || activeMethod === 'insert' || activeMethod === 'remove') {
      code += `
        get(index) {
          if (index < 0 || index >= this.length) return undefined;
          let current = this.head;
          for (let i = 0; i < index; i++) {
            current = current.next;
          }
          return current;
        }
      `;
    }
  
    if (activeMethod === 'insert') {
      code += `
        push(val) {
          const newNode = new Node(val);
          if (!this.head) {
              this.head = newNode;
              this.tail = newNode;
          } else {
              this.tail.next = newNode;
              this.tail = newNode;
          }
          this.length++;
          return this;
        }
  
        unshift(val) {
          const newNode = new Node(val);
          if (!this.head) {
              this.head = newNode;
              this.tail = newNode;
          } else {
              newNode.next = this.head;
              this.head = newNode;
          }
          this.length++;
          return this;
        }
      `;
    }
  
    if (activeMethod === 'remove') {
      code += `
        shift() {
          if (!this.head) return undefined;
          const currentHead = this.head;
          this.head = currentHead.next;
          currentHead.next = null;
          this.length--;
          if (this.length === 0) {
              this.tail = null;
          }
          return currentHead;
        }
  
        pop() {
          if (!this.head) return undefined;
          let current = this.head;
          let newTail = current;
          while (current.next) {
              newTail = current;
              current = current.next;
          }
          this.tail = newTail;
          this.tail.next = null;
          this.length--;
          if (this.length === 0) {
              this.head = null;
              this.tail = null;
          }
          return current;
        }
      `;
    }  

    code += `
        // User's method will be inserted here
      }
    `;
  
    return code;
  };;

  const methods = {
    push: {
      name: 'Push',
      description: 'Adds a new node to the end of the linked list.',
      explanation: `The push method should:
1. Create a new node
2. If the list is empty, set both head and tail to the new node
3. Otherwise, set the current tail's next to the new node and update tail
4. Increment length
5. Return the linked list`,
      template: `push(val) {
    // Add your code here
}`,
      tests: [
        {
          name: 'Test 1: Adding to empty list',
          description: 'Should correctly add a node to an empty list',
          code: `
const list = new LinkedList();
list.push(5);

// Verify:
1. head.val === 5
2. tail.val === 5
3. length === 1
4. head.next === null`,
          test: (list) => {
            list.push(5);
            return {
              passed: list.head.val === 5 && 
                     list.tail.val === 5 && 
                     list.length === 1 &&
                     list.head.next === null,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Adding to existing list',
          description: 'Should correctly add a node to a list with existing nodes',
          code: `
const list = new LinkedList();
list.push(5);
list.push(10);

// Verify:
1. head.val === 5
2. tail.val === 10
3. length === 2
4. head.next === tail`,
          test: (list) => {
            list.push(5);
            list.push(10);
            return {
              passed: list.head.val === 5 && 
                     list.tail.val === 10 && 
                     list.length === 2 &&
                     list.head.next === list.tail,
              listState: captureListState(list)
            };
          }
        }
      ]
    },
    pop: {
      name: 'Pop',
      description: 'Removes and returns the last node in the linked list.',
      explanation: `The pop method should:
    1. If list is empty, return undefined
    2. If length is 1:
       - Store the current head
       - Set head and tail to null
       - Decrement length
       - Return stored node
    3. Otherwise:
       - Loop until we reach second to last node
       - Store the tail node
       - Set new tail's next to null
       - Update tail to second to last node
       - Decrement length
       - Return stored node`,
      template: `pop() {
        // Add your code here
    }`,
      tests: [
        {
          name: 'Test 1: Popping from empty list',
          description: 'Should return undefined when popping from empty list',
          code: `
    const list = new LinkedList();
    const result = list.pop();
    
    // Verify:
    1. result === undefined
    2. length === 0
    3. head === null
    4. tail === null`,
          test: (list) => {
            const result = list.pop();
            return {
              passed: result === undefined && 
                     list.length === 0 && 
                     list.head === null && 
                     list.tail === null,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Popping from single node list',
          description: 'Should correctly remove and return the only node',
          code: `
    const list = new LinkedList();
    list.push(5);
    const popped = list.pop();
    
    // Verify:
    1. popped.val === 5
    2. length === 0
    3. head === null
    4. tail === null`,
          test: (list) => {
            list.push(5);
            const popped = list.pop();
            return {
              passed: popped.val === 5 && 
                     list.length === 0 && 
                     list.head === null && 
                     list.tail === null,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 3: Popping from multi-node list',
          description: 'Should correctly remove and return the last node',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(10);
    list.push(15);
    const popped = list.pop();
    
    // Verify:
    1. popped.val === 15
    2. length === 2
    3. head.val === 5
    4. tail.val === 10
    5. tail.next === null`,
          test: (list) => {
            list.push(5);
            list.push(10);
            list.push(15);
            const popped = list.pop();
            return {
              passed: popped.val === 15 && 
                     list.length === 2 && 
                     list.head.val === 5 && 
                     list.tail.val === 10 && 
                     list.tail.next === null,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 4: Multiple pops',
          description: 'Should handle multiple pop operations correctly',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(10);
    list.pop();
    list.pop();
    
    // Verify:
    1. length === 0
    2. head === null
    3. tail === null`,
          test: (list) => {
            list.push(5);
            list.push(10);
            list.pop();
            list.pop();
            return {
              passed: list.length === 0 && 
                     list.head === null && 
                     list.tail === null,
              listState: captureListState(list)
            };
          }
        }
      ]
    },
    shift: {
      name: 'Shift',
      description: 'Removes and returns the first node in the linked list.',
      explanation: `The shift method should:
    1. If list is empty, return undefined
    2. Store current head in variable
    3. Update head to be current head's next
    4. Decrement length
    5. If list is now empty, set tail to null
    6. Return removed node`,
      template: `shift() {
        // Add your code here
    }`,
      tests: [
        {
          name: 'Test 1: Shifting from empty list',
          description: 'Should return undefined when shifting from empty list',
          code: `
    const list = new LinkedList();
    const result = list.shift();
    
    // Verify:
    1. result === undefined
    2. length === 0
    3. head === null
    4. tail === null`,
          test: (list) => {
            const result = list.shift();
            return {
              passed: result === undefined && 
                     list.length === 0 && 
                     list.head === null && 
                     list.tail === null,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Shifting from single node list',
          description: 'Should correctly remove and return the only node',
          code: `
    const list = new LinkedList();
    list.push(5);
    const shifted = list.shift();
    
    // Verify:
    1. shifted.val === 5
    2. length === 0
    3. head === null
    4. tail === null`,
          test: (list) => {
            list.push(5);
            const shifted = list.shift();
            return {
              passed: shifted.val === 5 && 
                     list.length === 0 && 
                     list.head === null && 
                     list.tail === null,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 3: Shifting from multi-node list',
          description: 'Should correctly remove and return the first node',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(10);
    list.push(15);
    const shifted = list.shift();
    
    // Verify:
    1. shifted.val === 5
    2. length === 2
    3. head.val === 10
    4. tail.val === 15`,
          test: (list) => {
            list.push(5);
            list.push(10);
            list.push(15);
            const shifted = list.shift();
            return {
              passed: shifted.val === 5 && 
                     list.length === 2 && 
                     list.head.val === 10 && 
                     list.tail.val === 15,
              listState: captureListState(list)
            };
          }
        }
      ]
    },
    unshift: {
      name: 'Unshift',
      description: 'Adds a new node to the beginning of the linked list.',
      explanation: `The unshift method should:
    1. Create new node
    2. If list is empty:
       - Set head and tail to new node
    3. Otherwise:
       - Set new node's next to current head
       - Update head to be new node
    4. Increment length
    5. Return the linked list`,
      template: `unshift(val) {
        // Add your code here
    }`,
      tests: [
        {
          name: 'Test 1: Unshifting to empty list',
          description: 'Should correctly add node to empty list',
          code: `
    const list = new LinkedList();
    list.unshift(5);
    
    // Verify:
    1. head.val === 5
    2. tail.val === 5
    3. length === 1
    4. head.next === null`,
          test: (list) => {
            list.unshift(5);
            return {
              passed: list.head.val === 5 && 
                     list.tail.val === 5 && 
                     list.length === 1 &&
                     list.head.next === null,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Unshifting to existing list',
          description: 'Should correctly add node to start of list',
          code: `
    const list = new LinkedList();
    list.push(10);
    list.unshift(5);
    
    // Verify:
    1. head.val === 5
    2. head.next.val === 10
    3. tail.val === 10
    4. length === 2`,
          test: (list) => {
            list.push(10);
            list.unshift(5);
            return {
              passed: list.head.val === 5 && 
                     list.head.next.val === 10 && 
                     list.tail.val === 10 && 
                     list.length === 2,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 3: Multiple unshifts',
          description: 'Should correctly handle multiple unshift operations',
          code: `
    const list = new LinkedList();
    list.unshift(15);
    list.unshift(10);
    list.unshift(5);
    
    // Verify:
    1. length === 3
    2. head.val === 5
    3. head.next.val === 10
    4. tail.val === 15`,
          test: (list) => {
            list.unshift(15);
            list.unshift(10);
            list.unshift(5);
            return {
              passed: list.length === 3 && 
                     list.head.val === 5 && 
                     list.head.next.val === 10 && 
                     list.tail.val === 15,
              listState: captureListState(list)
            };
          }
        }
      ]
    },
    get: {
      name: 'Get',
      description: 'Retrieves the node at the specified index.',
      explanation: `The get method should:
    1. If index is less than 0 or >= length, return undefined
    2. Loop through the list until reaching index
    3. Return the node at that index`,
      template: `get(index) {
        // Add your code here
    }`,
      tests: [
        {
          name: 'Test 1: Get from empty list',
          description: 'Should return undefined when list is empty',
          code: `
    const list = new LinkedList();
    const result = list.get(0);
    
    // Verify:
    1. result === undefined`,
          test: (list) => {
            const result = list.get(0);
            return {
              passed: result === undefined,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Get with invalid index',
          description: 'Should return undefined for invalid indices',
          code: `
    const list = new LinkedList();
    list.push(5);
    const result1 = list.get(-1);
    const result2 = list.get(1);
    
    // Verify:
    1. result1 === undefined
    2. result2 === undefined`,
          test: (list) => {
            list.push(5);
            const result1 = list.get(-1);
            const result2 = list.get(1);
            return {
              passed: result1 === undefined && result2 === undefined,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 3: Get from valid index',
          description: 'Should return correct node at valid index',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(10);
    list.push(15);
    const node = list.get(1);
    
    // Verify:
    1. node.val === 10`,
          test: (list) => {
            list.push(5);
            list.push(10);
            list.push(15);
            const node = list.get(1);
            return {
              passed: node.val === 10,
              listState: captureListState(list)
            };
          }
        }
      ]
    },
    set: {
      name: 'Set',
      description: 'Updates the value of a node at the specified index.',
      explanation: `The set method should:
    1. Use get method to find the node
    2. If node is found, update its value and return true
    3. If node is not found, return false`,
      template: `set(index, val) {
        // Add your code here
    }`,
      tests: [
        {
          name: 'Test 1: Set on empty list',
          description: 'Should return false when list is empty',
          code: `
    const list = new LinkedList();
    const result = list.set(0, 5);
    
    // Verify:
    1. result === false`,
          test: (list) => {
            const result = list.set(0, 5);
            return {
              passed: result === false,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Set with invalid index',
          description: 'Should return false for invalid indices',
          code: `
    const list = new LinkedList();
    list.push(5);
    const result = list.set(1, 10);
    
    // Verify:
    1. result === false
    2. list still contains original value`,
          test: (list) => {
            list.push(5);
            const result = list.set(1, 10);
            return {
              passed: result === false && list.head.val === 5,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 3: Set with valid index',
          description: 'Should update value and return true',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(10);
    list.push(15);
    const result = list.set(1, 20);
    
    // Verify:
    1. result === true
    2. node at index 1 has new value`,
          test: (list) => {
            list.push(5);
            list.push(10);
            list.push(15);
            const result = list.set(1, 20);
            return {
              passed: result === true && list.get(1).val === 20,
              listState: captureListState(list)
            };
          }
        }
      ]
    },
    insert: {
      name: 'Insert',
      description: 'Inserts a new node at the specified index.',
      explanation: `The insert method should:
    1. If index < 0 or > length, return false
    2. If index === 0, unshift
    3. If index === length, push
    4. Otherwise:
       - Use get method to access node at index-1
       - Set new node's next to previous node's next
       - Set previous node's next to new node
    5. Increment length
    6. Return true`,
      template: `insert(index, val) {
        // Add your code here
    }`,
      tests: [
        {
          name: 'Test 1: Insert at invalid index',
          description: 'Should return false for invalid indices',
          code: `
    const list = new LinkedList();
    const result1 = list.insert(-1, 5);
    const result2 = list.insert(1, 5);
    
    // Verify:
    1. result1 === false
    2. result2 === false
    3. length === 0`,
          test: (list) => {
            const result1 = list.insert(-1, 5);
            const result2 = list.insert(1, 5);
            return {
              passed: result1 === false && 
                     result2 === false && 
                     list.length === 0,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Insert at beginning (unshift)',
          description: 'Should correctly insert at index 0',
          code: `
    const list = new LinkedList();
    list.push(10);
    const result = list.insert(0, 5);
    
    // Verify:
    1. result === true
    2. head.val === 5
    3. head.next.val === 10`,
          test: (list) => {
            list.push(10);
            const result = list.insert(0, 5);
            return {
              passed: result === true && 
                     list.head.val === 5 && 
                     list.head.next.val === 10,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 3: Insert in middle',
          description: 'Should correctly insert at middle index',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(15);
    const result = list.insert(1, 10);
    
    // Verify:
    1. result === true
    2. get(0).val === 5
    3. get(1).val === 10
    4. get(2).val === 15`,
          test: (list) => {
            list.push(5);
            list.push(15);
            const result = list.insert(1, 10);
            return {
              passed: result === true && 
                     list.get(0).val === 5 && 
                     list.get(1).val === 10 && 
                     list.get(2).val === 15,
              listState: captureListState(list)
            };
          }
        }
      ]
    },
    remove: {
      name: 'Remove',
      description: 'Removes the node at the specified index.',
      explanation: `The remove method should:
    1. If index < 0 or >= length, return undefined
    2. If index === 0, shift
    3. If index === length - 1, pop
    4. Otherwise:
       - Get previous node
       - Set previous node's next to next next node
       - Decrement length
    5. Return removed node`,
      template: `remove(index) {
        // Add your code here
    }`,
      tests: [
        {
          name: 'Test 1: Remove from empty list',
          description: 'Should return undefined when list is empty',
          code: `
    const list = new LinkedList();
    const result = list.remove(0);
    
    // Verify:
    1. result === undefined`,
          test: (list) => {
            const result = list.remove(0);
            return {
              passed: result === undefined,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Remove with invalid index',
          description: 'Should return undefined for invalid indices',
          code: `
    const list = new LinkedList();
    list.push(5);
    const result1 = list.remove(-1);
    const result2 = list.remove(1);
    
    // Verify:
    1. result1 === undefined
    2. result2 === undefined
    3. length === 1`,
          test: (list) => {
            list.push(5);
            const result1 = list.remove(-1);
            const result2 = list.remove(1);
            return {
              passed: result1 === undefined && 
                     result2 === undefined && 
                     list.length === 1,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 3: Remove from middle',
          description: 'Should correctly remove node from middle',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(10);
    list.push(15);
    const removed = list.remove(1);
    
    // Verify:
    1. removed.val === 10
    2. length === 2
    3. get(0).val === 5
    4. get(1).val === 15`,
          test: (list) => {
            list.push(5);
            list.push(10);
            list.push(15);
            const removed = list.remove(1);
            return {
              passed: removed.val === 10 && 
                     list.length === 2 &&
                     list.get(0).val === 5 &&
                     list.get(1).val === 15,
              listState: captureListState(list)
            };
          }
        }
      ]
    },
    reverse: {
      name: 'Reverse',
      description: 'Reverses the linked list in place.',
      explanation: `The reverse method should:
    1. Swap the head and tail
    2. Create variables: prev = null, current = head, next
    3. Loop through list:
       - Store next node before breaking link
       - Point current node backwards to prev
       - Move prev and current forward
    4. Return the list`,
      template: `reverse() {
        // Add your code here
    }`,
      tests: [
        {
          name: 'Test 1: Reverse empty list',
          description: 'Should handle empty list correctly',
          code: `
    const list = new LinkedList();
    list.reverse();
    
    // Verify:
    1. head === null
    2. tail === null
    3. length === 0`,
          test: (list) => {
            list.reverse();
            return {
              passed: list.head === null && 
                     list.tail === null && 
                     list.length === 0,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 2: Reverse single node',
          description: 'Should handle single node correctly',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.reverse();
    
    // Verify:
    1. head.val === 5
    2. tail.val === 5
    3. length === 1
    4. head.next === null`,
          test: (list) => {
            list.push(5);
            list.reverse();
            return {
              passed: list.head.val === 5 && 
                     list.tail.val === 5 && 
                     list.length === 1 &&
                     list.head.next === null,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 3: Reverse multiple nodes',
          description: 'Should correctly reverse a list with multiple nodes',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(10);
    list.push(15);
    list.reverse();
    
    // Verify:
    1. head.val === 15
    2. head.next.val === 10
    3. tail.val === 5
    4. length === 3
    5. Values are in reverse order`,
          test: (list) => {
            list.push(5);
            list.push(10);
            list.push(15);
            list.reverse();
            return {
              passed: list.head.val === 15 && 
                     list.head.next.val === 10 && 
                     list.tail.val === 5 && 
                     list.length === 3 &&
                     list.head.next.next === list.tail,
              listState: captureListState(list)
            };
          }
        },
        {
          name: 'Test 4: Double reverse',
          description: 'Should return to original order when reversed twice',
          code: `
    const list = new LinkedList();
    list.push(5);
    list.push(10);
    list.push(15);
    list.reverse();
    list.reverse();
    
    // Verify:
    1. head.val === 5
    2. head.next.val === 10
    3. tail.val === 15
    4. length === 3
    5. Values are in original order`,
          test: (list) => {
            list.push(5);
            list.push(10);
            list.push(15);
            list.reverse();
            list.reverse();
            return {
              passed: list.head.val === 5 && 
                     list.head.next.val === 10 && 
                     list.tail.val === 15 && 
                     list.length === 3 &&
                     list.head.next.next === list.tail,
              listState: captureListState(list)
            };
          }
        }
      ]
    }
  };

  const runTests = () => {
    try {
      const fullCode = getBaseCode(activeMethod).replace(
        '// User\'s method will be inserted here', 
        code
      );
      const evaluatedCode = new Function(`
        ${fullCode}
        return LinkedList;
      `)();

      const results = methods[activeMethod].tests.map(test => {
        try {
          const list = new evaluatedCode();
          const { passed, listState } = test.test(list);
          return {
            name: test.name,
            description: test.description,
            code: test.code,
            passed,
            listState,
            error: null
          };
        } catch (error) {
          return {
            name: test.name,
            description: test.description,
            code: test.code,
            passed: false,
            error: error.message,
            listState: {
              nodes: [],
              head: null,
              tail: null,
              length: 0,
              error: error.message
            }
          };
        }
      });

      setTestResults(results);

    } catch (error) {
      setTestResults([{
        name: 'Compilation Error',
        passed: false,
        error: error.message,
        listState: {
          nodes: [],
          head: null,
          tail: null,
          length: 0,
          error: error.message
        }
      }]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Learn Linked List Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMethod} onValueChange={setActiveMethod}>
            <TabsList className="mb-4">
              {Object.entries(methods).map(([key, method]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  onClick={() => {
                    setTestResults(null);
                    setCode('');
                  }}
                >
                  {method.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(methods).map(([key, method]) => (
              <TabsContent key={key} value={key}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{method.name}</h3>
                  <p className="mb-2">{method.description}</p>
                  <pre className="bg-slate-100 p-4 rounded-lg whitespace-pre-wrap">
                    {method.explanation}
                  </pre>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Test Cases</h3>
                  <div className="space-y-4">
                    {method.tests.map((test, index) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-semibold mb-2">{test.name}</h4>
                        <p className="mb-2 text-gray-600">{test.description}</p>
                        <pre className="bg-slate-100 p-4 rounded-lg whitespace-pre-wrap text-sm">
                          {test.code}
                        </pre>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono">
                    <div className="opacity-50 mb-4">
                      {getBaseCode(activeMethod).split('// User\'s method will be inserted here')[0]}
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-transparent focus:outline-none min-h-[200px] text-white"
                      placeholder="Write your code here..."
                    />
                    <div className="opacity-50">
                      {getBaseCode(activeMethod).split('// User\'s method will be inserted here')[1]}
                    </div>
                  </div>
                </div>

                {testResults && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                    <div className="space-y-4">
                      {testResults.map((result, index) => (
                        <TestResult key={index} result={result} />
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={runTests} className="mt-4">
                  Run Tests
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkedListLearning;
