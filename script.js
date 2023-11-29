var activeWindows = {}; // Keep track of active windows by ID
var highestZIndex = 1; // Track the highest z-index value
var taskbarButtons = document.getElementById('taskbar-buttons');

function startDrag(e) {
    var windowElement = document.getElementById('fileExplorer');
    activeWindow = windowElement;

    offsetX = e.clientX - activeWindow.getBoundingClientRect().left;
    offsetY = e.clientY - activeWindow.getBoundingClientRect().top;
}

function makeWindowDraggable(windowElement) {
    var offsetX, offsetY;
    var activeWindow = null;

    windowElement.addEventListener('mousedown', startDrag);
    windowElement.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        activeWindow = windowElement;

        if (e.type === 'mousedown') {
            offsetX = e.clientX - activeWindow.getBoundingClientRect().left;
            offsetY = e.clientY - activeWindow.getBoundingClientRect().top;
        } else if (e.type === 'touchstart' && e.touches.length === 1) {
            // Handle touch events for single touch
            var touch = e.touches[0];
            offsetX = touch.clientX - activeWindow.getBoundingClientRect().left;
            offsetY = touch.clientY - activeWindow.getBoundingClientRect().top;
        }

        // Bring the window to the front when clicked
        bringToFront(activeWindow);
        activateWindow(activeWindow);
    }

    function moveWindow(e) {
        if (activeWindow) {
            e.preventDefault();

            var x, y;

            if (e.type === 'mousemove') {
                x = e.clientX - offsetX;
                y = e.clientY - offsetY;
            } else if (e.type === 'touchmove' && e.touches.length === 1) {
                // Handle touch events for single touch
                var touch = e.touches[0];
                x = touch.clientX - offsetX;
                y = touch.clientY - offsetY;
            }

            activeWindow.style.left = x + 'px';
            activeWindow.style.top = y + 'px';
        }
    }

    function endDrag() {
        activeWindow = null;
    }

    windowElement.addEventListener('mousemove', moveWindow);
    windowElement.addEventListener('touchmove', moveWindow);

    windowElement.addEventListener('mouseup', endDrag);
    windowElement.addEventListener('touchend', endDrag);
}




function activateWindow(windowElement) {
    // Remove 'active' class from all windows
    Object.values(activeWindows).forEach(function (win) {
        win.classList.remove('active');
    });

    // Add 'active' class to the clicked window
    windowElement.classList.add('active');
}




function openFolder(windowId) {
    // Check if the folder is already open
    if (activeWindows[windowId]) {
        // If it's open and minimized, restore it
        if (activeWindows[windowId].style.display === 'none') {
            activeWindows[windowId].style.display = 'block';
            bringToFront(activeWindows[windowId]);
        } else {
            // If it's open and active, minimize it
            activeWindows[windowId].style.display = 'none';
            addTaskbarButton(windowId);
        }
    } else {
        // If it's not open, create a new instance
        var folderWindow = document.getElementById(windowId);
        folderWindow.style.display = 'block';

        // Calculate random position within the window bounds
        var maxX = window.innerWidth - folderWindow.offsetWidth;
        var maxY = window.innerHeight - folderWindow.offsetHeight;

        var randomX = Math.floor(Math.random() * maxX);
        var randomY = Math.floor(Math.random() * maxY);

        // Set the window's position
        folderWindow.style.left = randomX + 'px';
        folderWindow.style.top = randomY + 'px';

        makeWindowDraggable(folderWindow);
        activeWindows[windowId] = folderWindow;

        // Check if the taskbar button already exists
        if (!document.getElementById(windowId + '-taskbar-button')) {
            addTaskbarButton(windowId); // Add a button to the taskbar
        }

        bringToFront(folderWindow); // Bring the new instance to the foreground
    }
}



function closeWindow(windowId) {
    var windowElement = document.getElementById(windowId);
    windowElement.style.display = 'none';
    removeTaskbarButton(windowId);
}

function minimizeWindow(windowId) {
    var windowElement = document.getElementById(windowId);
    windowElement.style.display = 'none';
    addTaskbarButton(windowId);
}

var taskbarButtonClicked = false;

function getTaskbarButtonIcon(folderId) {
    switch (folderId) {
        case 'folderWindow1':
            return 'taskbar-button-1.png'; // Replace with the path to your icon
        case 'folderWindow2':
            return 'taskbar-button-2.png'; // Replace with the path to your icon
        // Add more cases for other folders
        default:
            return 'default-taskbar-button.png'; // Replace with a default icon path
    }
}

function addTaskbarButton(windowId) {
    taskbarButtonClicked = false;

    var windowElement = document.getElementById(windowId);
    var windowTitle = windowElement.querySelector('.window-title').innerText;
    var folderId = windowElement.id;

    // Check if the taskbar button already exists
    if (!document.getElementById(windowId + '-taskbar-button')) {
        var taskbarButton = document.createElement('div');
        taskbarButton.id = windowId + '-taskbar-button';
        taskbarButton.className = 'taskbar-button';

        // Create an image element for the button
        var imgElement = document.createElement('img');
        imgElement.src = getTaskbarButtonIcon(folderId);
        imgElement.alt = windowTitle;

        taskbarButton.appendChild(imgElement); // Add image to the button

        taskbarButton.onclick = function () {
            toggleWindow(windowId);
        };
        imgElement.style.width = '170px';
        imgElement.style.height = '29px';

        // Pixelated effect
        taskbarButton.style.imageRendering = 'pixelated';

        taskbarButton.style.paddingLeft = '1px';
        taskbarButton.style.paddingRight = '5px'; // Adjusted padding

        taskbarButtons.appendChild(taskbarButton); // Add a button to the taskbar
    }
}



function openImageWindow(windowId) {
    var imageWindow = document.getElementById(windowId);

    // Calculate center position
    var centerX = (window.innerWidth - imageWindow.offsetWidth) / 2;
    var centerY = (window.innerHeight - imageWindow.offsetHeight) / 2;

    // Set the window's position
    imageWindow.style.left = centerX + 'px';
    imageWindow.style.top = centerY + 'px';

    // Ensure the window stays within the bounds
    var x = Math.max(0, Math.min(centerX, window.innerWidth - imageWindow.offsetWidth)) - 200;
    var y = Math.max(0, Math.min(centerY, window.innerHeight - imageWindow.offsetHeight)) - 300;

    // Set the window's position
    imageWindow.style.left = x + 'px';
    imageWindow.style.top = y + 'px';

    // Make the image window draggable
    makeWindowDraggable(imageWindow);

    // Display the image window
    imageWindow.style.display = 'block';
    
    // Retrieve the image element
    var imageElement = document.getElementById('imageElement');

    // Set the image source based on the data attribute of the clicked image icon
    var clickedImage = event.target;
    var imagePath = clickedImage.getAttribute('data-image');
    imageElement.src = imagePath;
    // Bring the image window to the front
    bringToFront(imageWindow);
    activateWindow(imageWindow);

}

function openVideoWindow(windowId, videoPath) {
    var videoWindow = document.getElementById(windowId);
    document.getElementById('desktop').appendChild(videoWindow);
    var centerX = (window.innerWidth - videoWindow.offsetWidth) / 2;
    var centerY = (window.innerHeight - videoWindow.offsetHeight) / 2;

    // Ensure the window stays within the bounds
    var x = Math.max(0, Math.min(centerX, window.innerWidth - videoWindow.offsetWidth));
    var y = Math.max(0, Math.min(centerY, window.innerHeight - videoWindow.offsetHeight));

    // Set the window's position
    videoWindow.style.left = x + 'px';
    videoWindow.style.top = y + 'px';
    makeWindowDraggable(videoWindow);

    videoWindow.style.left = '50px';
    videoWindow.style.top = '50px';

    videoWindow.style.display = 'block';

    var videoElement = document.getElementById('videoElement');
    videoElement.src = videoPath;
    videoElement.autoplay = true;

    // Add event listener for the close button
    var closeButton = videoWindow.querySelector('.window-control');
    closeButton.onclick = function () {
        // Pause the video when the window is closed
        videoElement.pause();
        closeWindow(windowId);
    }

    // Add an event listener for the loadedmetadata event
    videoElement.addEventListener('loadedmetadata', function () {
        // Set video dimensions based on the actual video size
        var videoWidth = videoElement.videoWidth;
        var videoHeight = videoElement.videoHeight;

        // Adjust the size as needed
        var windowWidth = videoWidth * 0.35; // You can adjust this multiplier
        var windowHeight = videoHeight * 0.35;

        videoElement.style.width = windowWidth + 'px';
        videoElement.style.height = windowHeight + 'px';

        bringToFront(videoWindow);
        activateWindow(videoWindow);

    });
}



function removeTaskbarButton(windowId) {
    var taskbarButton = document.getElementById(windowId + '-taskbar-button');
    if (taskbarButton) {
        taskbarButtons.removeChild(taskbarButton);
    }
}

function toggleWindow(windowId) {
    var windowElement = document.getElementById(windowId);

    if (windowElement.style.display === 'none') {
        windowElement.style.display = 'block';
        removeTaskbarButton(windowId);
        bringToFront(windowElement);
    } else {
        // Check if the window is already in focus
        if (windowElement.style.zIndex < highestZIndex) {
            bringToFront(windowElement);
        } else {
            // If the window is already in focus, minimize it
            windowElement.style.display = 'none';

            // Only add the taskbar button if the window is not minimized by clicking the taskbar button
            if (!taskbarButtonClicked) {
                addTaskbarButton(windowId);
            }
        }
    }
}

// Add this event listener to handle mouse clicks and bring the window to the front
document.addEventListener('click', function (event) {
    var clickedWindow = event.target.closest('.window');
    if (clickedWindow) {
        bringToFront(clickedWindow);
    }
});

// Function to bring a window to the front

function bringToFront(windowElement) {
    // Move the window to the front
    windowElement.style.zIndex = ++highestZIndex;

}


function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12' in AM/PM

    var timeString = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

    clock.innerText = timeString;
}

setInterval(updateClock, 1000);

