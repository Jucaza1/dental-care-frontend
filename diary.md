# Journey
## Introduction
Firstly I created a simple go backend to serve the frontend application, with the
future option to send messages to the backend instead of using the browser
for storing data.

Started designing each page only visually (html and css): the landing page,
the appointment creation page, and the list of appointments page.

Later added typescript to add logic to the validation. At first when the script
was only retrieving the form data only compiling the typescript to javascript
was necesary to keep it working. But later when dependencies like zod for
validation were added (on node_modules), the browser couldnt import the lib
as it only lived in the node_modules.
To fix the issue of dependencies I researched information about bundlers and
proceeded to add webpack to the project.
From now on, webpack with the use of ts-loader is in charge of compiling and
bundling everyting into a single file in /public/dist/bundle.js .

After using zod I had to see the structure of the error from the validation,
to then design types for later use of these messages.

Once I have gathered all the error messages, it was time to add the logic to
display and clean the error messages next to each field.

Lastly I added a character counter using the onchange event for the textarea
label to display it as the limit was 200.

## Logic
Saving data on cookies was trivial, first serialize and then use a generated id
as a key and the stringified object as the value. After that I noticed that
for the cookies to be available on specific paths, the attribute (or parameter)
path=/; would enable the cookie to be visible from the whole domain.

Manage state of each row, replacewith method, refetch row if cancel...
To manage the state of each row in the table (display or edit mode) there are
buttons on the right column whose "onclick" and inner text depend on the current
state.

On edit mode, the save button collects and validates each field giving feedback
for the individual errors. Only after no errors, both the row and the data are
updated; bringing the row back to display state.
For deletion we are promted with a confirmation and provided we confirmed, both
the row and the data are erased. In our case using cookies as storage max-age
is set to 0.

## Docker
For ease of use I added docker commands to the makefile, alongside both
a Dockerfile and a docker-compose.yaml. The image is built on 2 stages:
- On the fisrt one we pull alpine and go together, then install node and npm.
- Finally both the go app and the static files are built and copied to the
resulting image.
