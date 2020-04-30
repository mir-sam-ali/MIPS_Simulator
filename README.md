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

.data
.text
.globl main
main:
addi $s1,$s1,1
addi $s2,$s2,1
beq $s1,$s2,end
addi $s3,$s3,1
end:
addi $s3,$s3,2
![Example]("./Example_Image/Example")
<img src="./Example_Image/Example"/>


The concerned source code is public/main.js
