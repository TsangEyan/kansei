// Quick Intructions show

$(document).ready(function () {
    $('.quick-instructions-item-title').click(function () {
        // Hide all descriptions
        $('.quick-instructions-item-description').slideUp();

        // Show the clicked description and scroll to it
        var description = $(this).next('.quick-instructions-item-description');
        description.slideToggle('slow', function () {
            // Check if the description is being opened, not closed
            if (description.is(':visible')) {
                description[0].scrollIntoView({behavior: 'smooth', block: 'center'});
            }
        });
    });
});

// workflow show
$(document).ready(function () {
    $('.navigation-item').click(function () {
        // Get the ID of the clicked item and build the ID for the related content
        var contentIdToShow = '#' + $(this).attr('id').replace('-Navigation', '-Workflow');
        var navigationIdToHide = '#' + $(this).attr('id');
        var sidebarIdToHide = '#' + $(this).attr('id').replace('-Navigation', '-Sidebar');
        var headerIdToHide = '#' + $(this).attr('id').replace('-Navigation', '-Header');


        // Hide all content elements
        $('.content').addClass('hidden');
        $('.sidebar-bottom').addClass('hidden');
        $('.header-button-show').addClass('hidden');
        // Show the related content element
        $(contentIdToShow).removeClass('hidden');
        $(sidebarIdToHide).removeClass('hidden');
        $(headerIdToHide).removeClass('hidden');

        $('.navigation-item').removeClass('navigation-item-active');
        $(navigationIdToHide).addClass('navigation-item-active');

        // Global 右侧栏显示
        if (navigationIdToHide === "#Global-Navigation"){
            $('.sidebar-right').removeClass('hidden');
        } else {
            $('.sidebar-right').addClass('hidden');
        }



    });
});

// Global层 feature的check-box
$(document).ready(function() {
    $('#add-feature').click(function() {
        // Count how many .check-box elements exist
        var count = $('.checkboxes-container .check-box').length;

        // Increment count to use for the new element's ID
        count++;

        // Create new .check-box element with unique IDs for its children
        var newCheckBox = `<div class="check-box">
            <input type="checkbox" id="feature-check-${count}"/>
            <textarea id="feature-value-${count}"></textarea>
        </div>`;

        // Append the new .check-box to the .checkboxes-container
        $('.checkboxes-container').append(newCheckBox);
    });
});

