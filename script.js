/* information about jsdocs: 
* param: http://usejsdoc.org/tags-param.html#examples
* returns: http://usejsdoc.org/tags-returns.html
* 
/**
 * Listen for the document to load and initialize the application
 */
$(document).ready(initializeApp);
/**
 * Define all global variables here.  
 */
/***********************
 * student_array - global array to hold student objects
 * @type {Array}
 * example of student_array after input: 
 * student_array = [
 *  { name: 'Jake', course: 'Math', grade: 85 },
 *  { name: 'Jill', course: 'Comp Sci', grade: 85 }
 * ];
 */
var student_array = [];
var isChecked;
var eventListener;


// var nameForm = $('#studentName');
// var courseForm = $('#course');
// var gradeForm = $('#studentGrade');
/***************************************************************************************************
* initializeApp 
* @params {undefined} none
* @returns: {undefined} none
* initializes the application, including adding click handlers and pulling in any data from the server, in later versions
*/
function initializeApp(){
      isChecked = document.getElementById("noAsking").checked;
      addClickHandlersToElements();
      getStudentData(); 
}

/***************************************************************************************************
* addClickHandlerstoElements
* @params {undefined} 
* @returns  {undefined}
*     
*/
function addClickHandlersToElements(){
      console.log('click handlers run');
      $('#studentName').focusin(function(){
            $('#studentName').removeClass('error');
            $('.glyphicon-user').removeClass('glyphError');
      });
      $('#course').focusin(function(){
            $('#course').removeClass('error');
            $('.glyphicon-list-alt').removeClass('glyphError');
      });
      $('#studentGrade').focusin(function(){
            $('#studentGrade').removeClass('error');
            $('.glyphicon-education').removeClass('glyphError');
      });

      eventListener = $("#studentGrade");
      eventListener.on("keyup", function(event) {
            if (event.keyCode === 13) {//if enter key is released
            $("#addBtn").click();//runs the function attaches to click event off add button
            }
      });
      // document.addEventListener("keyup", function(event) {
      // if (event.keyCode === 13) {
      //   $("#addBtn").click();
      // }
      // });
}

/***************************************************************************************************
 * handleAddClicked - Event Handler when user clicks the add button
 * @param {object} event  The event object from the click
 * @return: 
       none
 */
function handleAddClicked(){
      addStudent();
}
/***************************************************************************************************
 * handleCancelClicked - Event Handler when user clicks the cancel button, should clear out student form
 * @param: {undefined} none
 * @returns: {undefined} none
 * @calls: clearAddStudentFormInputs
 */
function handleCancelClick(){
      clearAddStudentFormInputs();
}
/***************************************************************************************************
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 * @param {undefined} none
 * @return undefined
 * @calls clearAddStudentFormInputs, updateStudentList
 */
function addStudent(){
      var student = {};
      student.name = $('#studentName').val();
      student.course = $('#course').val();
      student.grade = $('#studentGrade').val();
      if(!areInputsValid(student.name,student.course,student.grade)){//if any of the forms is invalid, disable adding student
            return;
      }
      student_array.push(student);
      console.log("Student Array: ", student_array);
      clearAddStudentFormInputs();
      updateStudentList(student_array[student_array.length-1]);
      sendDataToAPI(student);
}
/***************************************************************************************************
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentFormInputs(){
      console.log('Student forms cleared');
      $('#studentName').val("");
      $('#course').val("");
      $('#studentGrade').val("");
}
/***************************************************************************************************
 * renderStudentOnDom - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param {object} studentObj a single student object with course, name, and grade inside
 */

 //<button type="button" class="btn btn-danger">Danger</button>
function renderStudentOnDom(studentObj){
      var name = $('<td>',{
            text: studentObj.name,
            class: "studentName"
      })
      var course = $('<td>').text(studentObj.course);
      var grade = $('<td>').text(studentObj.grade);
      var deleteButton = $('<button>',{
            class: "btn btn-danger btn-xs",
            text: 'Delete'
      })
      var editButton = $('<button>',{
            class: "btn btn-warning btn-xs",
            text: 'Edit'
      })
      deleteButton.click(function(){
            var currentRow = $(this).parent().parent().parent();//select the current table row
            if(!isChecked){//if "Do not ask this again" is not checked
                  showDeleteModal(studentObj,currentRow);
            } else{
                  removeStudent(studentObj,currentRow);
            }
      });
      editButton.click(function(){
            showEditModal(studentObj,$('<td>'));
      })
      var buttonsDiv = $('<div>');
      var deleteTD = $('<td>');
      buttonsDiv.append(editButton,deleteButton).appendTo(deleteTD);
      var tableRowIndex = $('<tr>');
      tableRowIndex.append(name,course,grade,deleteTD).appendTo('tbody');
}

/***************************************************************************************************
 * updateStudentList - centralized function to update the average and call student list update
 * @param students {array} the array of student objects
 * @returns {undefined} none
 * @calls renderStudentOnDom, calculateGradeAverage, renderGradeAverage
 */
function updateStudentList(student){
      var currentStudent = student;
      renderStudentOnDom(currentStudent);
      renderGradeAverage(calculateGradeAverage());
}
/***************************************************************************************************
 * calculateGradeAverage - loop through the global student array and calculate average grade and return that value
 * @param: {array} students  the array of student objects
 * @returns {number}
 */
function calculateGradeAverage(){
      var sumOfGrades = 0;
      for(var a=0;a<student_array.length;a++){
            sumOfGrades+=parseInt(student_array[a].grade);
      }
      var average = Math.round(sumOfGrades/student_array.length);
      console.log("Current average: "+ average);
      return average;
}
/***************************************************************************************************
 * renderGradeAverage - updates the on-page grade average
 * @param: {number} average    the grade average
 * @returns {undefined} none
 */
function renderGradeAverage(averageGrade){
      if(student_array.length===0){
            averageGrade=0;
      }
      $('.avgGrade').text(averageGrade);
}

function removeStudent(student,row){
      var studentIndex = student_array.indexOf(student);
      var studentID = student_array[studentIndex].id;
      student_array.splice(studentIndex,1);
      row.remove();
      renderGradeAverage(calculateGradeAverage());
      deleteFromAPI(studentID);
}

function getStudentData(){
      var SGT_API = {
            url: 'http://s-apis.learningfuze.com/sgt/get',
            success: displayLFZ,
            method: 'post',
            data: {
                api_key: "5A8UhhZQaW"
            },
            dataType: 'json',
            error: showError,
        }
        $.ajax(SGT_API);
}

function displayLFZ(response){
  debugger;
      var july18Cohort = response.data;
      for(var s=0;s<july18Cohort.length;s++){
            student_array.push(july18Cohort[s]);
            updateStudentList(july18Cohort[s]);
      }
      console.log("Student_array after pulling API data: ", student_array);
}

function sendDataToAPI(student){
      var SGT_API = {
            url: 'http://s-apis.learningfuze.com/sgt/create',
            success: addDataToAPI,
            method: 'post',
            data: {
                api_key: "5A8UhhZQaW",
                name: student.name,
                course: student.course,
                grade: student.grade,
            },
            dataType: 'JSON',
            error: showError,
        }
        $.ajax(SGT_API);
}

function addDataToAPI(response){
      var lastStudent = student_array[student_array.length-1];
      console.log('success!');
      lastStudent.id = response.new_id;
}

function showError(){
      console.log('AJAX call failed')
}

function deleteFromAPI(ID){
      var SGT_API = {
            url: 'http://s-apis.learningfuze.com/sgt/delete',
            success: showSuccess,
            method: 'post',
            data: {
                api_key: "5A8UhhZQaW",
                student_id: ID
            },
            dataType: 'JSON',
            error: showError,
        }
        $.ajax(SGT_API)
}

function showSuccess(){
      console.log("Student deleted!");
}

function showDeleteModal(student,row){
      var modal = document.getElementById('deleteModal')
      var span = document.getElementsByClassName("close")[0];
      var deleteBtn = document.getElementById('delButton');
      var cancelBtn = document.getElementById('cancelButton');
      modal.style.display = "block";//display modal
      span.onclick = function() {//exit modal when click on x
            modal.style.display = "none";
      }
      window.onclick = function(event) {//exit modal when click anywhere outside of modal
            if (event.target == modal) {
                modal.style.display = "none";
            }
      }  
      deleteBtn.onclick = function(){//when delete button on modal is clicked
            removeStudent(student,row);
            isBoxChecked();
            modal.style.display = "none";
      }
      cancelBtn.onclick = function(){
            isBoxChecked();
            modal.style.display = "none";
      }
}

function isBoxChecked() {
      if(document.getElementById("noAsking").checked===true){
            isChecked = true;
      } else{
            isChecked = false;
      }
}

function areInputsValid(name,course,grade){
      var invalidCounter = 0;
      if (name<2 ){ 
            invalidCounter++;
            $('#studentName').val("");
            $('#studentName').attr("placeholder", "Enter at least 2 letters").addClass('red error');
            $('.glyphicon-user').addClass('glyphError');
      }
      if(course<2 ){ 
            invalidCounter++
            $('#course').val("");
            $('#course').attr("placeholder", "Enter at least 2 letters").addClass('red error');
            $('.glyphicon-list-alt').addClass('glyphError');
      }
      if(isNaN(grade) || grade.length<1){//if student grade input is not a number
            invalidCounter++
            $('#studentGrade').val("");//clear the student grade form
            $('#studentGrade').attr("placeholder", "Enter a valid number").addClass('red error');
            $('.glyphicon-education').addClass('glyphError');
      }
      if(invalidCounter===0){
            return true;
      }
}

function removeRedFromStudentForm(){
      $('#studentName').removeClass('red error').attr("placeholder", "Student Name");
      $('#studentName').closest().removeClass('red error');
      $('.glyphicon-user').removeClass('glyphError');
}

function removeRedFromCourseForm(){
      $('#course').removeClass('red error').attr("placeholder", "Student Course");
      $('#course').closest().removeClass('red error');
      $('.glyphicon-list-alt').removeClass('glyphError');
}

function removeRedFromGradeForm(){
      $('#studentGrade').removeClass('red error').attr("placeholder", "Student Grade");
      $('#studentGrade').closest().removeClass('red error');
      $('.glyphicon-education').removeClass('glyphError');
}

function showEditModal(student,td){
      var modal = document.getElementById('editModal')
      var span = document.getElementById("closeEdit");
      var editBtn = document.getElementById('editButton');
      var cancelEditBtn = document.getElementById('editCancelButton');
      modal.style.display = "block";//display modal
      span.onclick = function() {//exit modal when click on x
            modal.style.display = "none";
      }
      window.onclick = function(event) {//exit modal when click anywhere outside of modal
            if (event.target == modal) {
                modal.style.display = "none";
            }
      }  
      editBtn.onclick = function(){//when edit button on modal is clicked
            editDisplayedStudent(student,td)
            modal.style.display = "none";
      }
      cancelEditBtn.onclick = function(){
            modal.style.display = "none";
      }
}

function editDisplayedStudent(student,td){
      var nameInput = $('#studentName_edit').val();
      var studentIndex = student_array.indexOf(student);
      if(nameInput.length>1){
            student_array[studentIndex].name=$('#studentName_edit').val();
      }
      td.text(student_array[studentIndex].name)
}

