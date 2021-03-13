
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

let optionVideo = false
// XMLHttpRequest
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
        // alert(xhr.responseText);
    }
}


$(document).ready(function () {
    $('#btn-stop').click(
        
        function(){
            if(optionVideo){
                $('#btn-stop').text("Start")
                $('.video-output').css("display", "none")
                optionVideo = false
                xhr.open("POST", "/record_status");
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.send(JSON.stringify({ status: "true" }));
            }
            else{
                $('#btn-stop').text("Stop")
                $('.video-output').css("display", "flex")
                optionVideo = true
                xhr.open("POST", "/record_status");
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.send(JSON.stringify({ status: "false" }));
            }   
        }
    )
})