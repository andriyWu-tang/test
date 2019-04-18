const apiUrl = 'http://demo8267258.mockable.io/';
const storageKeyProducts = 'products';
const storageKeyLastProducts = 'lastProducts';
const productList = document.getElementById('productList');
const currentProductBlock = document.getElementById('currentProduct');
const lastProducts = document.getElementById('lastProducts');
const chartBlock = document.getElementById('chart');
const sortCheckbox = document.getElementById('sort');
const filterCheckbox = document.getElementById('filter');
const myForm = document.getElementById('myForm');
let dataProduct;
let products;
let currentProduct;
let authorizeUser;
let pagination;

getData = (url, done) => {
    return new Promise((resolve,reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => xhr.status === 200 ? resolve(JSON.parse(xhr.response)) : reject(xhr.statusText);
      xhr.onerror = error => reject(error);
      xhr.send();
    })
}
      
      myForm.addEventListener("submit", function(evt) {
        evt.preventDefault();
        getData(`${apiUrl}users`)
        .then(data => authorizeUser(data))
        .catch(error => console.error(error));
      });

    authorizeUser = users => {
      let arr = Array.prototype.slice.call(myForm.elements);
      let login = arr.find(x => x.name === 'username');
      let pass = arr.find(x => x.name === 'password');
      users.find(x => x.login === login.value && x.password === pass.value) ? getProducts() : alert('wrong login or password');
    }

      addProductToList = (product, list, className) => {
        let productItem = document.createElement('div');
        productItem.classList.add(className);
        list.appendChild(productItem);
        
        let img = document.createElement('img');
        img.classList.add("product_img");
        img.src = product.image;
        productItem.appendChild(img);

        let productInfo = document.createElement('div');
        productInfo.classList.add('product_info');
        productItem.appendChild(productInfo);

        let title = document.createElement('div');
        title.classList.add('align_center', 'bold');
        title.innerHTML = product.title.toUpperCase();
        productInfo.appendChild(title);

        let price = document.createElement('div');
        price.classList.add('font_big');
        price.innerHTML = `${product.price} $`;
        productInfo.appendChild(price);
  
        productItem.addEventListener("click", () => showCurrentProduct(product));
      };

      showCurrentProduct = product => {
        productList.style.display = 'none';
        lastProducts.style.display = 'none';
        currentProductBlock.style.display = 'block';
        currentProduct = product;
        document.getElementById('current_product_img').src = currentProduct.image;
        document.getElementById('current_product_title').innerHTML = currentProduct.title.toUpperCase();
        document.getElementById('current_product_description').innerHTML = currentProduct.description;
        let items = JSON.parse(localStorage.getItem(storageKeyLastProducts));
        let result;
        if(items){
          if(!items.find(x => x.id === currentProduct.id)) items.unshift(currentProduct);
          if(items.length > 3) items.pop()
          result = items;
        }else{
          result = [currentProduct];
        }
        localStorage.setItem(storageKeyLastProducts, JSON.stringify(result));
      }

      showProductList = () => {
        productList.style.display = 'block';
        currentProductBlock.style.display = 'none';
        lastProducts.style.display = 'none';
        chartBlock.style.display = 'none';
        document.getElementById('chartList').innerHTML = '';
        currentProduct = null;
      }

      addToChart = () => {
        currentProductBlock.style.display = 'none';
        chartBlock.style.display = 'block';

        let chartProducts = JSON.parse(localStorage.getItem(storageKeyProducts));
        chartProducts
          ? !chartProducts.find(x => x.id === currentProduct.id)
            ? chartProducts.push(currentProduct)
            : alert('product already exist')
          : chartProducts = [currentProduct];
        localStorage.setItem(storageKeyProducts, JSON.stringify(chartProducts));
        chartProducts.forEach(x => addChartListItem(x));
      }

      removeProductFromChart = title => {
        let arr = JSON.parse(localStorage.getItem(storageKeyProducts));
        let filteredArr = arr.filter(x => x.title !== title);
        let list = document.getElementById('chartList');
        for (let item of list.children) {
          if(item.firstChild.innerHTML === title) list.removeChild(item)
        }
        localStorage.setItem(storageKeyProducts, JSON.stringify(filteredArr));
      }

      addChartListItem = product => {
        let listItem = document.createElement('li');
        document.getElementById('chartList').appendChild(listItem);
        let title = document.createElement('span');
        title.innerHTML = product.title;
        let price = document.createElement('span');
        price.innerHTML = product.price;
        let button = document.createElement('button');
        button.innerHTML = 'Delete';
        listItem.appendChild(title);
        listItem.appendChild(price);
        listItem.appendChild(button);
        button.addEventListener('click', () => removeProductFromChart(product.title))
      }
      
      sortCheckbox.addEventListener('change', e => sortFunc(e.target.checked));
      
      filterCheckbox.addEventListener('change', e => filterFunc(e.target.checked));

      showLastProducts = () => {
        let items = JSON.parse(localStorage.getItem(storageKeyLastProducts));
        if(items){
          productList.style.display = 'none';
          lastProducts.style.display = 'block';
          let arr = document.getElementsByClassName('lastProduct_item');
          arr = Array.prototype.slice.call(arr);
          if(arr && arr.length) arr.forEach(x => x.parentNode.removeChild(x));
          items.forEach(x => addProductToList(x, lastProducts, 'lastProduct_item'));
        }else{
          alert('you have not seen any products');
        }
      }

      filterFunc = checked => {
        let items = document.getElementsByClassName('product_item');
        items = Array.prototype.slice.call(items);
        products = checked
          ? dataProduct.filter(x => x.title.toLowerCase() === 'orange' || x.title.toLowerCase() === 'tangerine')
          : dataProduct;
        pagination.init();
      }

      sortFunc = checked => {
        checked
          ? products.sort((a, b) => a.price - b.price)
          : products.sort((a,b) => Math.random() - 0.5);
        pagination.init();
      }

      showMainApp = () => {
        document.getElementsByClassName('main_login_container')[0].style.display = 'none';
        document.getElementById('main_container').style.display = 'block';
      }

      getProducts = () => {
        getData(`${apiUrl}products`)
        .then(data => {
          dataProduct = data;
          products = dataProduct;
          showMainApp();
          pagination = new Pagination();
          pagination.init();
        })
        .catch(error => console.error(error));
      }

    function Pagination() {
      
      const prevButton = document.getElementById('button_prev');
      const nextButton = document.getElementById('button_next');
      const clickPageNumber = document.querySelectorAll('.clickPageNumber');
      
      let current_page = 1;
      let records_per_page = 5;
      
      this.init = function() {
          changePage(current_page);
          pageNumbers();
          selectedPage();
          clickPage();
          addEventListeners();
     }
      
      let addEventListeners = function() {
          prevButton.addEventListener('click', prevPage);
          nextButton.addEventListener('click', nextPage);   
      }
            
      let selectedPage = function() {
          let page_number = document.getElementById('page_number').getElementsByClassName('clickPageNumber'); 
          page_number = Array.prototype.slice.call(page_number);

          page_number.forEach((x,index) => x.style.opacity = index == current_page - 1 ? "1.0" : "0.5");

          if(page_number.length < current_page && filterCheckbox.checked){
            current_page = page_number.length;
            changePage(current_page);
          } 
      }  
      
      let checkButtonOpacity = function() {
        current_page == 1 ? prevButton.classList.add('opacity') : prevButton.classList.remove('opacity');
        current_page == numPages() ? nextButton.classList.add('opacity') : nextButton.classList.remove('opacity');
      }

      changePage = function(page) {
          if (page < 1) page = 1; 
          if (page > (numPages() -1)) page = numPages();
       
          let items = document.getElementsByClassName('product_item');
          items = Array.prototype.slice.call(items);
          items.forEach(x => x.parentNode.removeChild(x)); 

          for(let i = (page -1) * records_per_page; i < (page * records_per_page) && i < products.length; i++) {
              addProductToList(products[i], productList, "product_item")
          }
          checkButtonOpacity();
          selectedPage();
      }

      let prevPage = function() {
          if(current_page > 1) {
              current_page--;
              changePage(current_page);
          }
      }

      let nextPage = function() {
          if(current_page < numPages()) {
              current_page++;
              changePage(current_page);
          } 
      }

      let clickPage = function() {
          document.addEventListener('click', function(e) {
              if(e.target.nodeName == "SPAN" && e.target.classList.contains("clickPageNumber")) {
                  current_page = e.target.textContent;
                  changePage(current_page);
              }
          });
      }

      let pageNumbers = function() {
          let pageNumber = document.getElementById('page_number');
              pageNumber.innerHTML = "";

          for(let i = 1; i < numPages() + 1; i++) {
              pageNumber.innerHTML += "<span class='clickPageNumber'>" + i + "</span>";
          }
      }

      let numPages = () => Math.ceil(products.length / records_per_page);
   }