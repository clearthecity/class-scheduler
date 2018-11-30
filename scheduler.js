var NUM_COURSES;
var NUM_ROOMS;

var NUM_STUDIOS;
var NUM_LABS;
var NUM_COMPUTERS;
var NUM_LEC_HALLS;

const SMALL_CLASS = 30;
const MED_CLASS = 40;
const LARGE_CLASS = 60;

var DAYS_OPEN;
var COURSES_PER_PROF;

var courses = [];
var rooms = [];
var professors = [];

const days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours_of_day = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00'];

var algorithms_tried;

function refresh() {
  document.getElementById("button-mcv").disabled = true;
  document.getElementById("button-genetic").disabled = true;
  document.getElementById("button-stop").disabled = true;
}

function setup() {
  clearArrays();
  clearTable();
  clearCalendar();
  algorithms_tried = 0;
  document.getElementById("calArea").style.display = "none";
  document.getElementById("stats").style.visibility = "hidden";

  NUM_COURSES = document.getElementById("input-courses").value;
  NUM_ROOMS = document.getElementById("input-rooms").value;
  DAYS_OPEN = document.getElementById("input-days").value;
  COURSES_PER_PROF = document.getElementById("input-per-prof").value;

  NUM_STUDIOS = Math.floor(NUM_ROOMS*0.10);
  NUM_LABS = Math.floor(NUM_ROOMS*0.15);
  NUM_COMPUTERS = Math.floor(NUM_ROOMS*0.15);
  NUM_LEC_HALLS = Math.floor(NUM_ROOMS*0.10);

  if ((NUM_ROOMS * DAYS_OPEN * hours_of_day.length) <= NUM_COURSES)
    alert("The total number of timeslots must be greater than the number of courses");

  else {
    createCourses();
    createRooms();
    document.getElementById("button-mcv").disabled = false;
    document.getElementById("button-genetic").disabled = false;
  }
  fillTable(courses);
}

function Course() {
  this.courseID = "";
  this.profIndex = -1; //index in professors[]
  this.roomIndex = -1; //index in rooms[]
  this.day = -1;
  this.hour = -1;
  this.seats = SMALL_CLASS;
  this.requiresComputer = false;
  this.requiresLab = false;
  this.requiresStudio = false;
  this.requiresWheelchair = false;
  this.satisfaction = -500;

  this.assignRoomIndices = function(r, d, h) {
    this.roomIndex = r;
    this.day = d; //array index
    this.hour = h;
  }
  this.clearAssignment = function() {
    this.assignRoomIndices(-1, -1, -1);
    this.satisfaction = -500;
  }

}

function Room() {
  this.roomID = "";
  this.seats = SMALL_CLASS;
  this.Computer = false;
  this.Lab = false;
  this.Studio = false;
  this.Wheelchair = true;
  this.Available = [];

  for (let d = 0; d < DAYS_OPEN; d++) {
    this.Available[d] = [];
    for (let h = 0; h < hours_of_day.length; h++) {
      this.Available[d][h] = true;
    }
  }
  this.resetAvailable = function() {
    for (let d = 0; d < DAYS_OPEN; d++) {
      for (let h = 0; h < hours_of_day.length; h++)
        this.Available[d][h] = true;
    }
  }
}

function Professor(id) {
  this.profID = id;
  this.prefersEarly = false;
  this.prefersLate = false;
  this.Available = [];
  this.dayOff = -1;
  this.timesOff = [];

  let timeRequest = Math.random();
  if (timeRequest <= 0.05) {
	   this.dayOff = Math.floor(Math.random()*DAYS_OPEN);
     // if the week is 1 or 2 days long, block off 4 hours; otherwise, block off the whole day
	    if (DAYS_OPEN <= 2) {
		    let firstHourOff = Math.floor(Math.random() * (hours_of_day.length-4));
		    for (let h = firstHourOff; h < (firstHourOff + 4); h++)
			    this.timesOff.push(h);
	    }
	    else {
		    for (let h = 0; h < hours_of_day.length; h++)
			    this.timesOff.push(h);
	    }
  }
  else if (timeRequest <= 0.15)
    this.prefersEarly = true;
  else if (timeRequest <= 0.25)
    this.prefersLate = true;

  //set up availability array
  for (let d = 0; d < DAYS_OPEN; d++) {
    this.Available[d] = [];
    for (let h = 0; h < hours_of_day.length; h++) {
      if (d == this.dayOff && this.timesOff.includes(h))
        this.Available[d][h] = false;
      else
        this.Available[d][h] = true;
    }
  }
  this.resetAvailable = function() {
    for (let d = 0; d < DAYS_OPEN; d++) {
      for (let h = 0; h < hours_of_day.length; h++) {
        if (d == this.dayOff && this.timesOff.includes(h))
          this.Available[d][h] = false;
        else
          this.Available[d][h] = true;
      }
    }
  }
}

function createCourses() {
for (let c = 0; c < NUM_COURSES; c++) {
  let newCourse = new Course();
  newCourse.courseID = "Course_" + eval(c+1);

  if (c % COURSES_PER_PROF == 0) {
    let newProfID = "Prof_" + Math.ceil((c+1)/COURSES_PER_PROF);
    let newProf = new Professor(newProfID);
    newCourse.profIndex = professors.length;
    professors.push(newProf);
  }
  else
    newCourse.profIndex = courses[c-1].profIndex;

  let randomSeats = Math.random();
  if (randomSeats > 0.60) {
    if (randomSeats < 0.90)
      newCourse.seats = MED_CLASS;
    else newCourse.seats = LARGE_CLASS;
  }

  let randomRoomRequest = Math.random();
  if (randomRoomRequest <= 0.20)
    newCourse.requiresComputer = true;
  else if (randomRoomRequest <= 0.40)
    newCourse.requiresLab = true;
  else if (randomRoomRequest <= 0.50)
    newCourse.requiresStudio = true;

  let randomWheelchair = Math.random();
  if (randomWheelchair <= 0.05)
    newCourse.requiresWheelchair = true;

  courses.push(newCourse);
}
}

function createRooms() {
  for (let i = 0; i < NUM_STUDIOS; i++) {
    let newStudio = new Room();
    newStudio.roomID = "Studio_" + eval(i+1);
    newStudio.Studio = true;
    rooms.push(newStudio);
  }
  for (let i = 0; i < NUM_LABS; i++) {
    let newScienceLab = new Room();
    newScienceLab.roomID = "Lab_" + eval(i+1);
    newScienceLab.Lab = true;
    rooms.push(newScienceLab);
  }
  for (let i = 0; i < NUM_COMPUTERS; i++) {
    let newComputerLab = new Room();
    newComputerLab.roomID = "Comp_" + eval(i+1);
    newComputerLab.Computer = true;
    newComputerLab.seats = MED_CLASS;
    rooms.push(newComputerLab);
  }
  for (let i = 0; i < NUM_LEC_HALLS; i++) {
    let newLectureHall = new Room();
    newLectureHall.roomID = "Lec_" + eval(i+1);
    newLectureHall.seats = LARGE_CLASS;
    rooms.push(newLectureHall);
  }
  for (let i = 0; i < (NUM_ROOMS - NUM_STUDIOS - NUM_LABS - NUM_COMPUTERS - NUM_LEC_HALLS); i++) {
    let newRoom = new Room();
    newRoom.roomID = "Room_" + eval(i+1);
    rooms.push(newRoom);
  }

  for (let j = 0; j < rooms.length; j++) {
    if (Math.random() <= 0.20)
      rooms[j].Wheelchair = false;

    if (rooms[j].seats <= MED_CLASS) {
      let randomSeats = Math.random();
      if (randomSeats <= 0.25)
        rooms[j].seats = MED_CLASS;
      else if (randomSeats <= 0.35)
        rooms[j].seats = LARGE_CLASS;
    }
  }
}

//---------------------------------------
// MCV algorithm and main schedule table
//----------------------------------------

function startMCV() {
  clearTable();

  if (algorithms_tried > 0) {
    for (let c = 0; c < courses.length; c++)
      courses[c].clearAssignment();
    for (let p = 0; p < professors.length; p++)
      professors[p].resetAvailable();
    for (let r = 0; r < rooms.length; r++)
      rooms[r].resetAvailable();
  }
  algorithms_tried++;

  mostConstrainedFirst();
  fillTable(courses);
  displayStats_MCV();
}

function mostConstrainedFirst() {

  //First pass
  for (let i = 0; i < courses.length; i++) {

    if (courses[i].seats == LARGE_CLASS) {
      let randomDay = Math.floor(Math.random() * DAYS_OPEN);
      let randomHour = Math.floor(Math.random() * hours_of_day.length);
      //if professor is busy at that time
      while (!professors[courses[i].profIndex].Available[randomDay][randomHour]) {
        randomDay = Math.floor(Math.random() * DAYS_OPEN);
        randomHour = Math.floor(Math.random() * hours_of_day.length);
      }
      for (let j = 0; j < rooms.length; j++) {
        if (rooms[j].seats == LARGE_CLASS) {
          if (!courses[i].requiresWheelchair || rooms[j].Wheelchair) {
            if (rooms[j].Available[randomDay][randomHour]) {
              courses[i].assignRoomIndices(j, randomDay, randomHour);
              professors[courses[i].profIndex].Available[randomDay][randomHour] = false;
              rooms[j].Available[randomDay][randomHour] = false;
              break;
            }
          }
        }
      }
    }

    else if (courses[i].requiresStudio) {
      let randomDay = Math.floor(Math.random() * DAYS_OPEN);
      let randomHour = Math.floor(Math.random() * hours_of_day.length);
      while (!professors[courses[i].profIndex].Available[randomDay][randomHour]) {
        randomDay = Math.floor(Math.random() * DAYS_OPEN);
        randomHour = Math.floor(Math.random() * hours_of_day.length);
      }
      for (let j = 0; j < rooms.length; j++) {
        if (rooms[j].Studio) {
          if (!courses[i].requiresWheelchair || rooms[j].Wheelchair) {
            if (rooms[j].Available[randomDay][randomHour]) {
              courses[i].assignRoomIndices(j, randomDay, randomHour);
              professors[courses[i].profIndex].Available[randomDay][randomHour] = false;
              rooms[j].Available[randomDay][randomHour] = false;
              break;
            }
          }
        }
      }
    }
    else if (courses[i].requiresLab) {
      let randomDay = Math.floor(Math.random() * DAYS_OPEN);
      let randomHour = Math.floor(Math.random() * hours_of_day.length);
      while (!professors[courses[i].profIndex].Available[randomDay][randomHour]) {
        randomDay = Math.floor(Math.random() * DAYS_OPEN);
        randomHour = Math.floor(Math.random() * hours_of_day.length);
      }
      for (let j = 0; j < rooms.length; j++) {
        if (rooms[j].Lab) {
          if (!courses[i].requiresWheelchair || rooms[j].Wheelchair) {
            if (rooms[j].Available[randomDay][randomHour]) {
                courses[i].assignRoomIndices(j, randomDay, randomHour);
                professors[courses[i].profIndex].Available[randomDay][randomHour] = false;
                rooms[j].Available[randomDay][randomHour] = false;
                break;
            }
          }
        }
      }
    }
    else if (courses[i].requiresComputer) {
      let randomDay = Math.floor(Math.random() * DAYS_OPEN);
      let randomHour = Math.floor(Math.random() * hours_of_day.length);
      while (!professors[courses[i].profIndex].Available[randomDay][randomHour]) {
        randomDay = Math.floor(Math.random() * DAYS_OPEN);
        randomHour = Math.floor(Math.random() * hours_of_day.length);
      }
      for (let j = 0; j < rooms.length; j++) {
        if (rooms[j].Computer) {
          if (!courses[i].requiresWheelchair || rooms[j].Wheelchair) {
            if (rooms[j].Available[randomDay][randomHour]) {
              courses[i].assignRoomIndices(j, randomDay, randomHour);
              professors[courses[i].profIndex].Available[randomDay][randomHour] = false;
              rooms[j].Available[randomDay][randomHour] = false;
              break;
            }
          }
        }
      }
    }
  }
  //Second pass: less-constrained rooms
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].roomIndex == -1) {

      let randomDay = Math.floor(Math.random() * DAYS_OPEN);
      let randomHour = Math.floor(Math.random() * hours_of_day.length);
      while (!professors[courses[i].profIndex].Available[randomDay][randomHour]) {
        randomDay = Math.floor(Math.random() * DAYS_OPEN);
        randomHour = Math.floor(Math.random() * hours_of_day.length);
      }

      if (courses[i].seats == MED_CLASS) {
        for (let j = 0; j < rooms.length; j++) {
          if (!courses[i].requiresWheelchair || rooms[j].Wheelchair) {
            if (rooms[j].seats == MED_CLASS) {
              if (rooms[j].Available[randomDay][randomHour]) {
                courses[i].assignRoomIndices(j, randomDay, randomHour);
                professors[courses[i].profIndex].Available[randomDay][randomHour] = false;
                rooms[j].Available[randomDay][randomHour] = false;
                break;
              }
            }
          }
        }
      }
      else if (courses[i].requiresWheelchair) {
        for (let j = 0; j < rooms.length; j++) {
          if (rooms[j].Wheelchair && rooms[j].Available[randomDay][randomHour]) {
            courses[i].assignRoomIndices(j, randomDay, randomHour);
            professors[courses[i].profIndex].Available[randomDay][randomHour] = false;
            rooms[j].Available[randomDay][randomHour] = false;
            break;
          }
        }
      }
    }
  }

  //Third pass: requests
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].roomIndex == -1) {

      let randomDay = Math.floor(Math.random() * DAYS_OPEN);
      let midday = Math.floor(hours_of_day.length/2);

      if (professors[courses[i].profIndex].prefersEarly) {
        let earlyHour = Math.floor(Math.random() * midday);
        while (!professors[courses[i].profIndex].Available[randomDay][earlyHour]) {
          randomDay = Math.floor(Math.random() * DAYS_OPEN);
          earlyHour = Math.floor(Math.random() * midday);
        }
        for (let j = 0; j < rooms.length; j++) {
          if (rooms[j].Available[randomDay][earlyHour]) {
            courses[i].assignRoomIndices(j, randomDay, earlyHour);
            professors[courses[i].profIndex].Available[randomDay][earlyHour] = false;
            rooms[j].Available[randomDay][earlyHour] = false;
            break;
          }
        }
      }
      else if (professors[courses[i].profIndex].prefersLate) {
        let lateHour = Math.floor(Math.random() * midday) + midday;
        while (!professors[courses[i].profIndex].Available[randomDay][lateHour]) {
          randomDay = Math.floor(Math.random() * DAYS_OPEN);
          lateHour = Math.floor(Math.random() * midday) + midday;
        }
        for (let j = 0; j < rooms.length; j++) {
          if (rooms[j].Available[randomDay][lateHour]) {
            courses[i].assignRoomIndices(j, randomDay, lateHour);
            professors[courses[i].profIndex].Available[randomDay][lateHour] = false;
            rooms[j].Available[randomDay][lateHour] = false;
            break;
          }
        }
      }
    }
  }

  //Fourth pass: remaining unassigned--fill at all costs
  for (let i = 0; i < courses.length; i++) {
    while (courses[i].roomIndex == -1) {

      let randomDay = Math.floor(Math.random() * DAYS_OPEN);
      let randomHour = Math.floor(Math.random() * hours_of_day.length);
      while (!professors[courses[i].profIndex].Available[randomDay][randomHour]) {
        randomDay = Math.floor(Math.random() * DAYS_OPEN);
        randomHour = Math.floor(Math.random() * hours_of_day.length);
      }

      for (let j = 0; j < rooms.length; j++) {
        if (rooms[j].Available[randomDay][randomHour]) {
          courses[i].assignRoomIndices(j, randomDay, randomHour);
          professors[courses[i].profIndex].Available[randomDay][randomHour] = false;
          rooms[j].Available[randomDay][randomHour] = false;
          break;
        }
      }
    }
  }
  updateAllSatScores(courses);
}

function fillTable(c_array) {
  var table = document.getElementById('courseTable');
  for (let i = 0; i < c_array.length; i++) {
    let row = table.insertRow();

    let courseCell = row.insertCell(0);
    courseCell.innerHTML = c_array[i].courseID;

    let profCell = row.insertCell();
    profCell.innerHTML = "<span class='prof-field'><span class='cal-link' onclick='javascript:writeProfCalendar(" + c_array[i].profIndex + ")'>" + professors[c_array[i].profIndex].profID + "</span></span>";

    let constraintCell = row.insertCell();
    let constraintString = "";
    if (c_array[i].requiresLab)
      constraintString += "Lab, ";
    if (c_array[i].requiresComputer)
        constraintString += "Computer, ";
    if (c_array[i].requiresStudio)
      constraintString += "Studio, "
    if (c_array[i].requiresWheelchair)
      constraintString += "Wheelchair, ";
    if (c_array[i].seats > SMALL_CLASS)
      constraintString += c_array[i].seats + " students "
    constraintCell.innerHTML = "<em>" + constraintString + "<em>";

    if (c_array[i].roomIndex != -1) {
    let timeCell = row.insertCell();
    if (c_array[i].day != -1 && c_array[i].hour != -1)
      timeCell.innerHTML = days_of_week[c_array[i].day] + " " + hours_of_day[c_array[i].hour];

    let roomCell = row.insertCell();
    if (c_array[i].roomIndex != -1) {
      roomCell.innerHTML = "<span class='room-field'><span class='cal-link' onclick='writeRoomCalendar(" + c_array[i].roomIndex + ")'>" + rooms[c_array[i].roomIndex].roomID + "</a></span>";
    }

    let satCell = row.insertCell();
    //Colours for satisfaction scores
    let score = c_array[i].satisfaction;
    if (score == 100)
      satCell.innerHTML = "<span style='background-color: #e0ffff'>" + c_array[i].satisfaction + "</span>";
    else if (score == -500)
      satCell.innerHTML = "<span style='background-color: #c94c4c'>" + c_array[i].satisfaction + "</span>";
    else if (score <= 40)
      satCell.innerHTML = "<span style='background-color: #eea29a'>" + c_array[i].satisfaction + "</span>";
    else
      satCell.innerHTML = c_array[i].satisfaction;
    }
  }
  document.getElementById("courseTable").style.display = "block";
}

function displayStats_MCV() {
  let avg_sat = averageSatisfaction(courses);
  document.getElementById("fitness-or-sat-info").innerHTML = "Average satisfaction: ";
  document.getElementById("fitness-of-best").innerHTML = avg_sat.toFixed(2);
  document.getElementById("generation-info").style.display = "none";
  document.getElementById("stats").style.visibility = "visible";
}

function clearTable() {
  let table = document.getElementById('courseTable');
  let rowCount = table.getElementsByTagName('tr').length;
  if (rowCount > 2) {
    for (let i = 2; i < rowCount; i++)
      table.deleteRow(2);
  }
}

function clearArrays() {
  courses = [];
  rooms = [];
  professors = [];
  current_gen = [];
  current_best = [];
}

function updateAllSatScores(c_array) {
  for (let i = 0; i < c_array.length; i++) {
    if (c_array[i].roomIndex == -1)
      c_array[i].satisfaction = -500;
    else {
      let score = calcSatisfaction(c_array[i], rooms[c_array[i].roomIndex], c_array[i].day, c_array[i].hour);
      c_array[i].satisfaction = score;
    }
  }
}

function calcSatisfaction(course, room, day, hour) {
  if (room == -1) return -500;
  let sat_score = 100;
  if (course.requiresLab && !room.Lab)
    sat_score -= 70;
  if (course.requiresStudio && !room.Studio)
    sat_score -= 70;
  if (course.requiresComputer && !room.Computer)
    sat_score -= 60;
  if (course.requiresWheelchair && !room.Wheelchair)
    sat_score -= 70;
  if (course.seats > room.seats)
    sat_score -= 3*(course.seats - room.seats);

  if (!course.requiresLab && room.Lab)
    sat_score -= 20;
  if (!course.requiresComputer && room.Computer)
    sat_score -= 20;
  if (!course.requiresStudio && room.Studio)
    sat_score -= 20;

  if (course.seats == SMALL_CLASS && room.seats == LARGE_CLASS)
    sat_score -= 10;

  if (professors[course.profIndex].prefersEarly && hour > hours_of_day.length/2)
	  sat_score -= 10;
  if (professors[course.profIndex].prefersLate && hour < hours_of_day.length/2)
	  sat_score -= 10;

  return sat_score;
}

function averageSatisfaction(c_array) {
  let sum = 0;
  for (let i = 0; i < c_array.length; i++)
    sum += c_array[i].satisfaction;
  return sum / c_array.length;
}

//-------------------------
// Calendars
//-------------------------

//Creates empty table for calendar
function setUpCalTable() {
  let table = document.getElementById("calTable");
  let headerRow = table.insertRow();
  let emptyHeaderCell = headerRow.insertCell();
  emptyHeaderCell.innerHTML = "";

  for (let i = 0; i < DAYS_OPEN; i++) {
    let dayHeaderCell = headerRow.insertCell();
    dayHeaderCell.innerHTML = "<span class='cal-header'>" + days_of_week[i] + "</span>";
  }
  for (let j = 0; j < hours_of_day.length; j++) {
    let row = table.insertRow();
    let timeHeaderCell = row.insertCell();
    timeHeaderCell.innerHTML = "<span class='cal-header'>" + hours_of_day[j] + "</span>";
    for (let k = 0; k < DAYS_OPEN; k++) {
      let timeCell = row.insertCell();
      timeCell.innerHTML = "<span class='cal-avail'> &nbsp; </span>";
    }
  }
}

function clearCalendar() {
  let table = document.getElementById("calTable");
  let rowCount = table.getElementsByTagName('tr').length;
  for (let i = 0; i < rowCount; i++)
    table.deleteRow(0);
  document.getElementById("personal-prefs").innerHTML = "";
}

function hideCalendarArea() {
  document.getElementById("calArea").style.display = "none";
}

//Calendars are displayed opposite of regular availability array (hours x days)
function writeRoomCalendar(roomIndex) {
  clearCalendar();
  setUpCalTable();
  let table = document.getElementById("calTable");
  table.getElementsByTagName("caption")[0].innerHTML = rooms[roomIndex].roomID;
  for (let d = 0; d < DAYS_OPEN; d++) {
    for (let h = 0; h < hours_of_day.length; h++) {
      if (!rooms[roomIndex].Available[d][h]) {
        let hourRow = table.getElementsByTagName("tr")[h+1];
        let targetCell = hourRow.getElementsByTagName("td")[d+1];
        targetCell.innerHTML = "<span class='cal-unavail'> &nbsp; </span>";
      }
    }
  }
  document.getElementById("calArea").style.display = "block";
  let personalString = "<em>";
  personalString += "Seats " + rooms[roomIndex].seats;
  if (!rooms[roomIndex].Wheelchair)
    personalString += "<br>No wheelchair access";
  personalString += "</em>";
  document.getElementById("personal-prefs").innerHTML = personalString;
}

function writeProfCalendar(profIndex) {
  clearCalendar();
  setUpCalTable();
  let table = document.getElementById("calTable");
  table.getElementsByTagName("caption")[0].innerHTML = professors[profIndex].profID;
  for (let d = 0; d < DAYS_OPEN; d++) {
    for (let h = 0; h < hours_of_day.length; h++) {
      if (!professors[profIndex].Available[d][h]) {
        let hourRow = table.getElementsByTagName("tr")[h+1];
        let targetCell = hourRow.getElementsByTagName("td")[d+1];
        targetCell.innerHTML = "<span class='cal-unavail'> &nbsp; </span>";
      }
    }
  }
  document.getElementById("calArea").style.display = "block";
  let personalString = "<em>";
  if (professors[profIndex].dayOff != -1)
    personalString += "Personal day: " + days_of_week[professors[profIndex].dayOff];
  if (professors[profIndex].prefersEarly)
    personalString += "Prefers early classes ";
  else if (professors[profIndex].prefersLate)
    personalString += "Prefers late classes ";
  personalString += "</em>";
  document.getElementById("personal-prefs").innerHTML = personalString;
}

//-------------------------
// Genetic algorithm
//--------------------------

var current_gen = [];
var current_best = [];

var NUM_GENERATIONS;
var MUTATION_RATE;
var DEGREE_OF_MUTATION;
var CROSSOVER_RATE;
var POPULATION_SIZE;
var SPEED;
var genCount;
var timer;

function startGenetic() {

  NUM_GENERATIONS = document.getElementById("input-generations").value;
  POPULATION_SIZE = document.getElementById("input-population").value;
  CROSSOVER_RATE = document.getElementById("input-crossover").value / 100;
  MUTATION_RATE = document.getElementById("input-mutation").value / 100;
  DEGREE_OF_MUTATION = document.getElementById("input-mut-deg").value / 100;
  SPEED = document.getElementById("input-speed").value;

  if (algorithms_tried > 0) {
    for (let c = 0; c < courses.length; c++)
      courses[c].clearAssignment();
    for (let p = 0; p < professors.length; p++)
      professors[p].resetAvailable();
    for (let r = 0; r < rooms.length; r++)
      rooms[r].resetAvailable();
  }
  algorithms_tried++;

  clearTable();
  document.getElementById("button-stop").disabled = false;
  document.getElementById("button-mcv").disabled = true;

  genCount = 0;
  firstGeneration();

  let first_gen_fitnesses = calcGenFitnesses(current_gen);
  let fittest_index = findFittestIndex(first_gen_fitnesses);
  for (let i = 0; i < courses.length; i++)
    current_best[i] = current_gen[fittest_index][i];

  alignWithCurrentBest();
  fillTable(current_best);

  let best_sat = averageSatisfaction(current_best);
  displayStats_Genetic(best_sat);

  if (NUM_GENERATIONS > 1)
    timer = setInterval(nextGeneration, SPEED);

}

function stopGenerations() {
  clearInterval(timer);
  alignWithCurrentBest();
  clearTable();
  fillTable(current_best);
  document.getElementById("button-stop").disabled = true;
  document.getElementById("button-mcv").disabled = false;
}

function firstGeneration() {
  /*
  i = schedule
  j = course in schedule (i)
  */
  for (let i = 0; i < POPULATION_SIZE; i++) {

    for (let p = 0; p < professors.length; p++)
      professors[p].resetAvailable();
    for (let r = 0; r < rooms.length; r++)
      rooms[r].resetAvailable();

	  //Copy unassigned courses to internal array
    current_gen[i] = [];
    for (let j = 0; j < courses.length; j++) {
      let copiedCourse = copyCourse(courses[j]);
      current_gen[i][j] = copiedCourse;
    }

    //Make a random schedule
    for (let j = 0; j < current_gen[i].length; j++) {
      let randomDay = Math.floor(Math.random() * DAYS_OPEN);
      let randomHour = Math.floor(Math.random() * hours_of_day.length);

      //if professor is already working at that time
      while (!professors[current_gen[i][j].profIndex].Available[randomDay][randomHour]) {
        randomDay = Math.floor(Math.random() * DAYS_OPEN);
        randomHour = Math.floor(Math.random() * hours_of_day.length);
      }
      //add class timeslot to prof's schedule
      professors[current_gen[i][j].profIndex].Available[randomDay][randomHour] = false;

      //assign to random room
      let randomRoom = Math.floor(Math.random() * rooms.length);
      while (!rooms[randomRoom].Available[randomDay][randomHour])
        randomRoom = Math.floor(Math.random() * rooms.length);

      current_gen[i][j].assignRoomIndices(randomRoom, randomDay, randomHour);
    }
    updateAllSatScores(current_gen[i]);
  }
  genCount++;
}

function copyCourse(orig) {
  let copiedCourse = new Course();
  copiedCourse.courseID = orig.courseID;
  copiedCourse.profIndex = orig.profIndex;
  copiedCourse.seats = orig.seats;
  copiedCourse.requiresComputer = orig.requiresComputer;
  copiedCourse.requiresLab = orig.requiresLab;
  copiedCourse.requiresStudio = orig.requiresStudio;
  copiedCourse.requiresWheelchair = orig.requiresWheelchair;
  copiedCourse.roomIndex = orig.roomIndex;
  copiedCourse.day = orig.day;
  copiedCourse.hour = orig.hour;
  copiedCourse.satisfaction = orig.satisfaction;
  return copiedCourse;
}

function findFittestIndex(fitnesses) {
  let highest_fitness = 0.0;
  let index = -1;
  for (let i = 0; i < fitnesses.length; i++) {
    if (fitnesses[i] > highest_fitness) {
      highest_fitness = fitnesses[i];
      index = i;
    }
  }
  return index;
}

function nextGeneration() {

  let fitnesses = calcGenFitnesses(current_gen);
  /*
  if (genCount % 100 == 0)
    console.log(genCount + " fitnesses: " + fitnesses); //testing fit function
  */
  let fittest_index = findFittestIndex(fitnesses);
  if (averageSatisfaction(current_gen[fittest_index]) > averageSatisfaction(current_best)) {
    current_best = current_gen[fittest_index];
    alignWithCurrentBest();
    clearTable();
    fillTable(current_best);
  }

  best_sat = averageSatisfaction(current_best);
  displayStats_Genetic(best_sat);

  let roulette_wheel = makeRouletteWheel(fitnesses);

  let new_gen = [];

	for (let i = 0; i < POPULATION_SIZE/2; i++) {

    for (let p = 0; p < professors.length; p++)
      professors[p].resetAvailable();
    for (let r = 0; r < rooms.length; r++)
      rooms[r].resetAvailable();

    let p1_index = selectFromWheel(roulette_wheel);
    let p2_index = selectFromWheel(roulette_wheel);
    while (p1_index == p2_index)
      p2_index = selectFromWheel(roulette_wheel);

		let parent_1 = current_gen[p1_index];
    let parent_2 = current_gen[p2_index];

    if (Math.random() <= CROSSOVER_RATE) {
      let offspring = crossover(parent_1, parent_2);
      new_gen[i] = offspring[0];
      updateAllSatScores(new_gen[i]);
      new_gen[i + POPULATION_SIZE/2] = offspring[1];
      updateAllSatScores(new_gen[i+POPULATION_SIZE/2]);
    }
    else {
      new_gen[i] = parent_1;
      new_gen[i + POPULATION_SIZE/2] = parent_2;
    }

    if (Math.random() <= MUTATION_RATE) {
      mutate(new_gen[i]);
      updateAllSatScores(new_gen[i]);
    }
    if (Math.random() <= MUTATION_RATE) {
      mutate(new_gen[i + POPULATION_SIZE/2]);
      updateAllSatScores(new_gen[i + POPULATION_SIZE/2]);
    }

	}
	current_gen = new_gen;

  genCount++;

  if (genCount > NUM_GENERATIONS) {
    clearInterval(timer);
    alignWithCurrentBest();
    clearTable();
    fillTable(current_best);
    document.getElementById("button-stop").disabled = true;
    document.getElementById("button-mcv").disabled = false;
  }
}

/*
fitness function: adapted from class slide #29
fit(sched) = (1/avg_sat)/denom where denom is the sum of (1/avg_sat) for the generation
*/
function calcGenFitnesses(gen_array) {
  let denom = 0;
  let avg_sat;
  for (let i = 0; i < gen_array.length; i++) {
    avg_sat = averageSatisfaction(gen_array[i]);
    if (avg_sat != 0)
      denom += (1/avg_sat);
  }
  let fitnesses = [];
  for (let i = 0; i < gen_array.length; i++) {
    avg_sat = averageSatisfaction(gen_array[i]);
    if (avg_sat == 0)
      fitnesses[i] = 0;
    else
      fitnesses[i] = (1/avg_sat)/denom;
  }
  return fitnesses;
}

function makeRouletteWheel(fitnesses) {
  let wheel = [];
  for (let i = 0; i < fitnesses.length; i++) {
    if (i == 0)
      wheel[i] = 0;
    else if (i < fitnesses.length - 1)
      wheel[i] = wheel[i-1] + fitnesses[i];
    else
      wheel[i] = 1;
  }
  return wheel;
}

function selectFromWheel(wheel) {
  let r = Math.random();
  for (let i = 0; i < wheel.length; i++) {
    if (r <= wheel[i])
      return i;
  }
  return -1;
}

//One-point crossover
function crossover(parent_1, parent_2) {
  let offspring = [];
  offspring[0] = [];
  offspring[1] = [];
  let r, p, d, h;
  //var insertion_point = Math.floor(parent_1.length/2);
  let insertion_point = Math.floor(Math.random()*parent_1.length);

  //Offspring[0]
  for (let i = 0; i < insertion_point; i++) {
    r = parent_1[i].roomIndex;
    p = parent_1[i].profIndex;
    d = parent_1[i].day;
    h = parent_1[i].hour;
    offspring[0][i] = copyCourse(parent_1[i]);
    rooms[r].Available[d][h] = false;
    professors[p].Available[d][h] = false;
  }
  for (let i = insertion_point; i < parent_2.length; i++) {
    r = parent_2[i].roomIndex;
    p = parent_2[i].profIndex;
    d = parent_2[i].day;
    h = parent_2[i].hour;

    if (rooms[r].Available[d][h] && professors[p].Available[d][h]) {
      offspring[0][i] = copyCourse(parent_2[i]);
      rooms[r].Available[d][h] = false;
      professors[p].Available[d][h] = false;
    }
    else {
      let adjustedCourse = resolveCollision(parent_2[i]);
      offspring[0][i] = adjustedCourse;
      rooms[adjustedCourse.roomIndex].Available[adjustedCourse.day][adjustedCourse.hour] = false;
      professors[adjustedCourse.profIndex].Available[adjustedCourse.day][adjustedCourse.hour] = false;
    }
  }
  //reset for next schedule
  for (let p = 0; p < professors.length; p++)
    professors[p].resetAvailable();
  for (let r = 0; r < rooms.length; r++)
    rooms[r].resetAvailable();

  //now fill offspring[1]
  for (let i = 0; i < insertion_point; i++) {
    r = parent_2[i].roomIndex;
    p = parent_2[i].profIndex;
    d = parent_2[i].day;
    h = parent_2[i].hour;
    offspring[1][i] = copyCourse(parent_2[i]);
    rooms[r].Available[d][h] = false;
    professors[p].Available[d][h] = false;
  }
  for (let i = insertion_point; i < parent_2.length; i++) {
    r = parent_1[i].roomIndex;
    p = parent_1[i].profIndex;
    d = parent_1[i].day;
    h = parent_1[i].hour;

    if (rooms[r].Available[d][h] && professors[p].Available[d][h]) {
      offspring[1][i] = copyCourse(parent_1[i]);
      rooms[r].Available[d][h] = false;
      professors[p].Available[d][h] = false;
    }
    else {
      let adjustedCourse = resolveCollision(parent_1[i]);
      offspring[1][i] = adjustedCourse;
      rooms[adjustedCourse.roomIndex].Available[adjustedCourse.day][adjustedCourse.hour] = false;
      professors[adjustedCourse.profIndex].Available[adjustedCourse.day][adjustedCourse.hour] = false;
    }
  }
  return offspring;
}

function resolveCollision(crs) {
  let adjustedCourse = copyCourse(crs);
  let r = adjustedCourse.roomIndex;
  let p = adjustedCourse.profIndex;
  let d = adjustedCourse.day;
  let h = adjustedCourse.hour;

  //better to change time and keep room
  for (let new_day = (d+1)%DAYS_OPEN; new_day < DAYS_OPEN; new_day++) {
    for (let new_hr = (d+1)%hours_of_day.length; new_hr < hours_of_day.length; new_hr++) {
      if (professors[p].Available[new_day][new_hr] && rooms[r].Available[new_day][new_hr]) {
        adjustedCourse.day = new_day;
        adjustedCourse.hour = new_hr;
        return adjustedCourse;
      }
    }
  }
  for (let new_rm = (r+1)%NUM_ROOMS; new_rm < NUM_ROOMS; new_rm++) {
    if (professors[p].Available[d][h] && rooms[new_rm].Available[d][h]) {
      adjustedCourse.roomIndex = new_rm;
      return adjustedCourse;
    }
  }
  //last resort
  for (let new_rm = 0; new_rm < NUM_ROOMS; new_rm++) {
    for (let new_day = 0; new_day < DAYS_OPEN; new_day++) {
      for (let new_hr = 0; new_hr < hours_of_day.length; new_hr++) {
        if (professors[p].Available[new_day][new_hr] && rooms[new_rm].Available[new_day][new_hr]) {
          adjustedCourse.roomIndex = new_rm;
          adjustedCourse.day = new_day;
          adjustedCourse.hour = new_hr;
          return adjustedCourse;
        }
      }
    }
  }
  console.log("Couldn't resolve collision with " + crs.courseID);
  return adjustedCourse;
}

function mutate(c_array) {
  let mutationAmount = Math.floor(c_array.length*DEGREE_OF_MUTATION);
  let mutationStartPoint = Math.floor(Math.random() * (c_array.length - mutationAmount));
  let d, h, r;

  for (let i = mutationStartPoint; i < mutationAmount; i++) {
    if (c_array[i].satisfaction < 80) {
      d = c_array[i].day;
      h = c_array[i].hour;
      r = c_array[i].roomIndex;

      //try five rooms, then give up
      let new_rm = Math.floor(Math.random()*rooms.length);
      if (!rooms[new_rm].Available[d][h]) {
        new_rm = tryFourRooms(d, h);
        if (new_rm != -1) {
          rooms[r].Available[d][h] = true;
          c_array[i].assignRoomIndices(new_rm, d, h);
          rooms[new_rm].Available[d][h] = false;
        }
      }
      else {
        rooms[r].Available[d][h] = true;
        c_array[i].assignRoomIndices(new_rm, d, h);
        rooms[new_rm].Available[d][h] = false;
      }
    }
  }
}

function tryFourRooms(d, h) {
  let new_rm;
  for (let n = 0; n < 4; n++) {
    new_rm = Math.floor(Math.random()*rooms.length);
    if (rooms[new_rm].Available[d][h])
      return new_rm;
  }
  return -1;
}

function generationAvgSat(gen_array) {
  let sum = 0;
  for (let i = 0; i < gen_array.length; i++) {
    sum += averageSatisfaction(gen_array[i]);
  }
  return sum / gen_array.length;
}

//makes rooms[] and profs[] reflect current_best schedule, for calendar functions in GA
function alignWithCurrentBest() {
  for (let r = 0; r < rooms.length; r++)
    rooms[r].resetAvailable();
  for (let p = 0; p < professors.length; p++)
    professors[p].resetAvailable();

  for (let i = 0; i < current_best.length; i++) {
    rooms[current_best[i].roomIndex].Available[current_best[i].day][current_best[i].hour] = false;
    professors[current_best[i].profIndex].Available[current_best[i].day][current_best[i].hour] = false;
  }
}

function displayStats_Genetic(best_sat) {
  document.getElementById("fitness-or-sat-info").innerHTML = "Highest average satisfaction: ";
  document.getElementById("fitness-of-best").innerHTML = best_sat.toFixed(2) + ". ";
  document.getElementById("gen-number").innerHTML = genCount;
  document.getElementById("generation-info").style.display = "inline";
  document.getElementById("stats").style.visibility = "visible";
}
