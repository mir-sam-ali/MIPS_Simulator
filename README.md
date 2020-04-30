# MIPS_Simulator
Computer Architecture Course Project

Visit the page at https://mipssimulator.herokuapp.com/

Phase-1:

Users can simulate the MIPS Architecture using this website. Users can write assembly code in the IDE provided and can see the changes made by each instruction in the registers and the memory.

Phase-2:

Upon running a MIPS assembly code, Users can now know the number of pipeline cycles taken for executing the code. The total number of stalls occured are also shown.
Users can also see the whole cycle timeline.

Example:
Upon running the below code:

<p>.data</p>
<p>.text</p>
<p>.globl main</p>
<p>main:</p>
<p>addi $s1,$s1,1</p>
<p>addi $s2,$s2,1</p>
<p>beq $s1,$s2,end</p>
<p>addi $s3,$s3,1</p>
<p>end:</p>
<p>addi $s3,$s3,2</p>

<h4>The below image is the cycle timeline for the above code</h4>
<img src="https://github.com/mir-sam-ali/MIPS_Simulator/blob/master/Example.png?raw=true"/>



