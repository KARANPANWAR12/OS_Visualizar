class Process {
  constructor(pid, at, bt, priority) {
    this.pid = pid;
    this.at = at;
    this.bt = bt;
    this.remainingTime = bt;
    this.priority = priority;
    this.originalPriority = priority;
    this.ct = 0;
    this.tat = 0;
    this.wt = 0;
    this.started = false;
  }
}

// Milestone 2: Priority Queue Sort Function
function sortQueue(queue) {
  return queue.sort((a, b) => {
    if (a.priority === b.priority) return a.at - b.at;
    return a.priority - b.priority; // Lower number = higher priority
  });
}

// Milestone 5: Aging function (boosts priority over time)
function applyAging(readyQueue, currentTime) {
  for (let proc of readyQueue) {
    if (proc.at < currentTime && proc.remainingTime > 0) {
      proc.priority = Math.max(1, proc.priority - 1); // Boost priority (e.g., every cycle)
    }
  }
}

// Milestone 3 & 4: Core Scheduler Loop with Preemption + Context Switching
function preemptivePriorityScheduler(processes, totalTime) {
  let currentTime = 0;
  let readyQueue = [];
  let completed = [];

  while (currentTime < totalTime) {
    // Add new arrivals
    for (let proc of processes) {
      if (proc.at === currentTime && !readyQueue.includes(proc) && proc.remainingTime > 0) {
        readyQueue.push(proc);
      }
    }

    // Apply aging
    applyAging(readyQueue, currentTime);

    // Sort by updated priority
    readyQueue = sortQueue(readyQueue);

    const current = readyQueue.find(p => p.remainingTime > 0);
    if (current) {
      if (!current.started) current.started = true;

      current.remainingTime--;

      // Context switch simulation (log switch)
      console.log(`[${currentTime}] CPU: Running ${current.pid} (Priority ${current.priority})`);

      if (current.remainingTime === 0) {
        current.ct = currentTime + 1;
        current.tat = current.ct - current.at;
        current.wt = current.tat - current.bt;
        completed.push(current);
        // Remove from queue
        readyQueue = readyQueue.filter(p => p !== current);
      }
    } else {
      console.log(`[${currentTime}] CPU: Idle`);
    }

    currentTime++;
  }

  // Print result
  console.log("\nFinal Result:");
  console.log("+------+-----+-----+----------+-----+-----+-----+");
  console.log("| PID  | AT  | BT  | Priority | CT  | TAT | WT  |");
  console.log("+------+-----+-----+----------+-----+-----+-----+");
  for (let p of completed) {
    console.log(
      `| ${p.pid.padEnd(4)} | ${String(p.at).padEnd(3)} | ${String(p.bt).padEnd(3)} | ${String(p.originalPriority).padEnd(8)} | ${String(p.ct).padEnd(3)} | ${String(p.tat).padEnd(3)} | ${String(p.wt).padEnd(3)} |`
    );
  }
  console.log("+------+-----+-----+----------+-----+-----+-----+");

  const avgWT = completed.reduce((sum, p) => sum + p.wt, 0) / completed.length;
  const avgTAT = completed.reduce((sum, p) => sum + p.tat, 0) / completed.length;

  console.log(`\nAverage Waiting Time: ${avgWT.toFixed(2)}`);
  console.log(`Average Turnaround Time: ${avgTAT.toFixed(2)}`);
}

/////////////////////////////////////////////////////
// Milestone 6: Test with a sample scenario
const sampleProcesses = [
  new Process("P1", 0, 7, 2),
  new Process("P2", 1, 4, 1),
  new Process("P3", 2, 6, 3),
  new Process("P4", 3, 5, 2),
  new Process("P5", 4, 2, 1),
];

const totalTime = 50;

// Comment out the automatic execution for now
// preemptivePriorityScheduler(sampleProcesses, totalTime);

// Add form handling functionality
document.addEventListener('DOMContentLoaded', function() {
    const runBtn = document.getElementById('runBtn');

    runBtn.addEventListener('click', function() {
        const operation = document.getElementById('operation').value || 'trace';
        const algorithm = document.getElementById('algorithm').value || '1,2-3,3';
        const lastTime = document.getElementById('lastTime').value || '30';
        const processData = document.getElementById('processData').value;

        if (!processData.trim()) {
            alert('Please enter process data');
            return;
        }

        // Parse process data
        const lines = processData.trim().split('\n');
        const processCount = lines.length;

        // Generate input.txt content
        let inputContent = `${operation} ${algorithm} ${lastTime} ${processCount}\n`;
        lines.forEach(line => {
            inputContent += line.trim() + '\n';
        });

        // Create and download the input.txt file
        const blob = new Blob([inputContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'input.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('input.txt generated! Now run the run.bat file to execute the simulation.');
    });
});
