function changeQty(cartId, productId, count, event) {
    event.preventDefault()
    $.ajax({
        url: '/cart/change-qty',
        data: {
            cart: cartId,
            product: productId,
            count: count
        },
        method: 'POST',
        success: (response) => {
            $("#refresh-section").load(location.href + " #refresh-section");
        }
    })
}

function changeSize(cartId, productId, size, event) {
    event.preventDefault()
    console.log("hello");
    $.ajax({
        url: '/cart/change-size',
        data: {
            cart: cartId,
            product: productId,
            size:size
        },
        method: 'POST',
        
    })
}

function removecCartProduct(cartId, productId) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger mr-3'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/cart/removeProduct',
                data: {
                    cart: cartId,
                    product: productId
                },
                method: 'POST',
                success: (response) => {
                    $("#refresh-section").load(location.href + " #refresh-section");
                }
            })
            swalWithBootstrapButtons.fire(
                'Deleted!',
                'Your product has been removed.',
                'success'
            )
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
            )
        }
    })
    
}



function removeWhishlistProduct(wishlistId, productId) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger mr-3'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $(document).ready(() => {
                $.ajax({
                    url: '/wishlist/removeproduct',
                    data: {
                        wishlist: wishlistId,
                        product: productId
                    },
                    method: 'POST',
                    success: (response) => {
                        $("#refresh-section").load(location.href + " #refresh-section");
                    }
                })
            })
            swalWithBootstrapButtons.fire(
                'Deleted!',
                'Your product has been removed.',
                'success'
            )
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
            )
        }
    })
}




function addtoWhishList(productId) {
    $.ajax({
        method: 'POST',
        url: '/add-to-whishlist',
        data: {
            product: productId
        },
        success: (response) => {
            console.log("success");
            //  $("#refresh-section").load(location.href+" #refresh-section");
        }
    })
}


function addtoCart(productId, event) {
    event.preventDefault()
    $(document).ready(() => {
        $.ajax({
            method: "post",
            url: "/add-to-cart",
            data: { productId },
            success: (response) => {
            }
        })
    })

}


function submitAddress() {
    const name = $("#name").val()
    const mobile = $("#mobile").val()
    const pincode = $("#pincode").val()
    const address = $("#address").val()
    const locality = $("#locality").val()
    const district = $("#district").val()
    const state = $("#state").val()

    console.log(name, state);

    $.ajax({
        method: "post",
        url: "/add-new-address",
        data: {
            name,
            mobile,
            pincode,
            address,
            locality,
            district,
            state
        },
        success: (response) => {
            window.location.reload()
        }
    })
}

function getPostalDetails(event) {
    const pincode = $("#pincode").val()
    const district = $("#district")
    const state = $("#state")
    console.log(pincode);
    $.ajax({
        url: `https://api.postalpincode.in/pincode/${pincode}`,
        method: 'get',
        success: (response) => {
            console.log(response);
            if (response) {
                const dis = response[0].PostOffice[0].District;
                const sta = response[0].PostOffice[0].State;
                district.val(dis)
                state.val(sta)
            }
        }
    })
}

function changeAddress(address) {
    const p1 = $("#name")
    const p2 = $("#addr")
    const addrId = $("#addressId")
    console.log("here", address);
    $.ajax({
        url: '/change-address',
        method: 'post',
        data: { address },
        success: (response) => {
            const nameAndPin = `${response[0].address.name}, ${response[0].address.pincode}`
            const address = `${response[0].address.address}, ${response[0].address.mobile}, ${response[0].address.district}, ${response[0].address.state}`
            const addressId =
                p1.text(nameAndPin)
            p2.text(address)
            addrId.val(response[0].address.time)
        }
    })
}


function deleteAddress(addrId) {
    $.ajax({
        url: '/delete-address',
        data: { addrId },
        method: "post",
        success: (response) => {
            console.log(response);
            if (response.status)
                $('#refresh-section').load(location.href + " #refresh-section")
        }
    })
}

function editAddress(addrId) {
    $.ajax({
        url: '/edit-address',
        data: $("#edit-addr-form").serialize(),
        method: 'post',
        success: (response) => {
            $("#modalCenter" + addrId).modal("hide")
            $('#refresh-section').load(location.href + " #refresh-section")
        }
    })
}

function editProfile() {
    console.log($("#edit-profile-form").serialize());
    $.ajax({
        url: '/edit-profile',
        data: $("#edit-profile-form").serialize(),
        method: "post",
        success: (response) => {
            $('#refresh-section').load(location.href + " #refresh-section")
            $('#refresh-section1').load(location.href + " #refresh-section1")
        }
    })
}

function placeOrder(event) {
    console.log($('#place-order-form').serialize());
    event.preventDefault()
    $.ajax({
        url: '/place-order',
        method: 'post',
        data: $('#place-order-form').serialize(),
        success: (order) => {
            if (order.sts) {
                popup.classList.add("open-popup")
            } else {
                const options = {
                    "key": "rzp_test_yCPnhowiHhtpuX", // Enter the Key ID generated from the Dashboard
                    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                    "currency": "INR",
                    "name": "Acme Corp",
                    "description": "Test Transaction",
                    //"image": "https://example.com/your_logo",
                    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                    "handler": function (response) {
                        verifyPayment(response, order)
                    },
                    "prefill": {
                        "name": "Gaurav Kumar",
                        "email": "gaurav.kumar@example.com",
                        "contact": "9999999999"
                    },
                    "notes": {
                        "address": "Razorpay Corporate Office"
                    },
                    "theme": {
                        "color": "#3399cc"
                    }
                };

                var rzp1 = new Razorpay(options);
                rzp1.open();
            }
        }
    })
}


function verifyPayment(payment, order) {
    let popup = document.getElementById("popup");
    $.ajax({
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        method: "post",
        success: (response) => {
            if (response.signatureIsValid) {
                popup.classList.add("open-popup")
            }
        }
    })
}

function closePopup() {
    popup.classList.remove("open-popup")
    location.href = '/myaccount/orders'
}


function create_coupon_discount(event) {
    event.preventDefault()
    $.ajax({
        url: '/cart/submit_coupon',
        data: { coupon: $("#coupon_input").val() },
        method: "post",
        success: (response) => {
            console.log(response);
            if (response.status.isValid) {
                $("#discount").text(`Rs.${response.discount.discount}`)
                $("#total").text(`Rs.${response.discount.d_total}`)
                $("#coupon-applied").text(`Coupon Applied! ${response.discount.discount}`)
                $('#remove').text("Remove")
            }
        }
    })
}


function removeCoupon(event) {
    event.preventDefault()
    console.log("here")
    $.ajax({
        url: "/remove-coupon",
        method:"post",
        success: (response) => {
            window.location.reload()
        }
    })
}

$(document).ready(function () {
    $('#table_id').DataTable()
    new $.fn.dataTable.Responsive(table, {
        details: false
    });
});


