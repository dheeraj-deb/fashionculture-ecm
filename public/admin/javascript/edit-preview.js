
function viewImage1(event) {
    document.querySelector('#imgView1').src = URL.createObjectURL(event.target.files[0])
    console.log(document.querySelector('#imgView1'));
}

function viewImage2(event) {
    document.querySelector('#imgView2').src = URL.createObjectURL(event.target.files[0])
    console.log(document.querySelector('#imgView2'));
}

function viewImage3(event) {
    document.querySelector('#imgView3').src = URL.createObjectURL(event.target.files[0])
    console.log(document.querySelector('#imgView3'));
}
