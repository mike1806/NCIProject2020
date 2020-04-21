$(function () {

    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta');
    }

    $('a.acceptDelete').on('click', function () {
        if (!confirm('Are you sure to delete content?'))
            return false;
    });
	$('form.acceptDelete').on('click', function () {
        if (!confirm('Are you sure to delete content?'))
            return false;
    });
    
    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }

});


