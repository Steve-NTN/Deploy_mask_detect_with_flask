
// $("#click_predict").click(clickPredict)
$("#click_back").click(clickBack)

var loadFile = function(event) {
    var image = document.getElementById('img');
    image.src = URL.createObjectURL($("#img-input").files[0]);
};

function clickPredict() {
    var formData = new FormData($('#myform')[0]);
    // var files = $('#file')[0].files[0];
    $.ajax({
        type:'POST',
        url: '/predict',
        data:formData,
        contentType: false,
        processData: false,
    }).done(function(response){
        debugger
    }).fail(function(response){
        debugger
    });
}

function clickBack() {
    
}

function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('#img-input-show').attr('src', e.target.result);
      }
      reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
  }
  
  $("#img-input").change(function() {
    readURL(this);
  });

//   ________

  $(document).ready(function () {
    // Init
    $('.image-section').hide();
    $('.loader-h').hide();
    $('#result').hide();

    // Upload Preview
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
                $('.img-preview').hide();
                $('.img-preview').fadeIn(650);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#img-input").change(function () {
        $('.image-section').show();
        $('#btn-predict').show();
        $('#result').hide();
        readURL(this);
    });

    // Predict
    $('#btn-predict').click(function () {
        var form_data = new FormData($('#upload-file')[0]);

        // Show loading animation
        $(this).hide();
        $('.loader-h').css("display", "flex");

        // Make prediction by calling api /predict
        $.ajax({
            type: 'POST',
            url: '/image',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                // Get and display the result
                $('.loader-h').hide();
                $('#result').fadeIn(600);
                $('#image-output').css('background-image', 'url("data:image/jpg;base64,' + data + '")');
            },
        });
    });

});

// Xử lí khi tắt và dừng ghi video
let displayVideo = false

$(document).ready(function () {
    $('#btn-playvideo').click(
        function(){
            if(displayVideo){
                $('#btn-playvideo').text("Start")
                $('.video-output').css("display", "none")
                displayVideo = false
                window.location = "/video"
            }
            else{
                $('#btn-playvideo').text("Stop")
                $('.video-output').css("display", "flex")
                displayVideo = true
            }   
            
            $.ajax({
                type: 'POST',
                url: '/record_status',
                data: JSON.stringify({ playVideo: displayVideo }),
                contentType: 'application/json',
                success: function (data) {
                    // console.log(data)
                },
            });
        }
    )
})