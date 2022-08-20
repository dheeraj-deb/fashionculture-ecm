$(document).ready(()=>{
    $("#filter-women").on("click", ()=>{
        $.ajax({
            url:"/filter-category",
            data:{filter:"women's"},
            type:"POST",
            success:(data)=>{
                $("#refresh-section").load(location.href+" #refresh-section");
            }
        })
    }),
    $("#filter-allProducts").on("click", ()=>{
        $.ajax({
            url:'/all-products',
            type:'POST',
            success:(data)=>{
                $("#refresh-section").load(location.href+" #refresh-section");
            }
        })
    }),
    $("#filter-men").on("click", ()=>{
        $.ajax({
            url:"/filter-category",
            data:{filter:"men's"},
            type:"POST",
            success:(data)=>{
                $("#refresh-section").load(location.href+" #refresh-section");
            }
        })
    }),

    $("#filter-kids").on("click", ()=>{
        $.ajax({
            url:"/filter-category",
            data:{filter:"kids"},
            type:"POST",
            success:(data)=>{
                $("#refresh-section").load(location.href+" #refresh-section");
            }
        })
    })
    
   
    
})


 function filterLowToHigh(filter, event){
        event.preventDefault()
        console.log(filter);
        console.log(event);
        $.ajax({
            url:'/products/filterByPrice',
            data:{filter},
            type:"POST",
            success:(response) => {
                $("#refresh-section").load(location.href+" #refresh-section");
            }
        })
}

function filterHighToLow(filter, event){
    event.preventDefault()
    console.log(filter);
    console.log(event);
    $.ajax({
        url:'/products/filterByPrice',
        data:{filter},
        type:"POST",
        success:(response) => {
            $("#refresh-section").load(location.href+" #refresh-section");
        }
    })
}