    $(document).ready(function(){
    $("#userForm").validate({
      errorClass: "valierrors",
  
      rules:{
        f_name:{
          required:true,
          minlength:3
        },
        l_name:{
          required:true,
          minlength:1
        },
        email:{
          required:true,
          email:true
        },
  
        mobile:{
          required:true,
          minlength:10
        },
  
        password:{
          required:true,
          minlength: 5
        },
        c_password:{
            required:true,
            equalTo:'#password'
        }
      }
    })
  })