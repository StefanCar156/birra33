$(document).ready(() => {
  // Display beers
  let currentPage = 1
  let productsPerPage = 9
  const beersContainer = $(".products-beers")
  let beers
  let sortedBeers
  let sortByParam
  let baseUrl = `https://api.punkapi.com/v2/beers?page=${currentPage}&per_page=${productsPerPage}`
  let url = `https://api.punkapi.com/v2/beers?page=${currentPage}&per_page=${productsPerPage}`
  let minAbv = 100
  let maxAbv = 0
  const loadingModal = $(".loading-modal")

  const displayBeers = async () => {
    loadingModal.addClass("loading-modal-active")
    const response = await fetch(url)
    const data = await response.json()
    beers = data
    sortedBeers = beers
    sortBeerData()

    let output = ""

    $.each(sortedBeers, (i, beer) => {
      let { image_url, name, id, description, abv } = beer

      // If no image is provided, set some default one
      if (!image_url) {
        image_url = "../dist/images/beer-bottle.png"
      }

      output += `
        <article class="products-card card">
          <div class="card-img-wrapper">
            <img src=${image_url} alt=${name} class="card-img" />
            <button class="card-img-wrapper-btn" data-id=${id}><i class="fas fa-link"></i></button>
          </div>
          <div class="card-details">
            <h3 class="card-heading">${name}</h3>
            <p class="card-description">${description}</p>
            <p class="card-abv">${abv}</p>
            <button class="card-btn" data-title=${name} data-id=${id} data-img=${image_url} data-abv=${abv}>add to cart</button>
          </div>
        </article>
      `
    })

    // If no beers are returned
    const noBeersNotification = `
      <div class="no-beers-container">
        <p class="no-beers-notification">No beers that match your filters.</p>
        <button class="no-beers-btn">reset filters</button>
      </div>
    `

    if (beers.length === 0) {
      output = noBeersNotification
    }

    beersContainer.html(output)
    setNumberOfPages()
    setNumberOfShownResults()
    loadingModal.removeClass("loading-modal-active")
  }
  displayBeers()

  // Products modal
  const productsModalContainer = $(".products-modal")

  const displayProductsModal = (e) => {
    productsModalContainer.addClass("products-modal-active")
    const target = $(e.target)
    const beerID = target.attr("data-id")
    let selectedBeer = {}
    $.each(beers, (i, beer) => {
      if (beer.id == beerID) {
        selectedBeer = beer
      }
    })

    const { image_url, name, description, food_pairing, ingredients } =
      selectedBeer

    let foodList = ""

    $.each(food_pairing, (i, food) => {
      const listItem = `<li class="modal-list-item"><i class="fas fa-chevron-right"></i> ${food}</li>`
      foodList += listItem
    })

    const { malt, hops, yeast } = ingredients

    let maltIngredients = []
    let hopsIngredients = []

    $.each(malt, (i, ing) => {
      maltIngredients.push(ing.name)
    })

    $.each(hops, (i, ing) => {
      hopsIngredients.push(ing.name)
    })

    let maltIngredientsOutput = maltIngredients.join(", ")
    let hopsIngredientsOutput = hopsIngredients.join(", ")

    let ingredientsList = `
     <li class="modal-list-item"><div><i class="fas fa-chevron-right"></i> <b>Malt:</b></div> ${maltIngredientsOutput}</li>
     <li class="modal-list-item"><div><i class="fas fa-chevron-right"></i> <b>Hops:</b></div> ${hopsIngredientsOutput}</li>
     <li class="modal-list-item"><div><i class="fas fa-chevron-right"></i> <b>Yeast:</b></div> ${yeast}</li>
      `

    let modalOutput = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <button class="modal-close-btn">×</button>
      <div class="modal-img-wrapper"><img src=${image_url} alt=${name} class="modal-img" /></div>
      <div class="modal-info">
        <h3 class="modal-heading">${name}</h3>
        <p class="modal-description">${description}</p>
        <div class="modal-lists">
          <ul class="modal-list">
          <h3 class="modal-list-heading">Best paired with:</h3>
          ${foodList}
          </ul>
          <ul class="modal-list modal-list-ingredients">
            <h3 class="modal-list-heading">Ingredients:</h3>
            ${ingredientsList}
          </ul>
        </div>
        <button class="card-btn modal-btn" data-title=${selectedBeer.name} data-id=${selectedBeer.id} data-img=${selectedBeer.image_url} data-abv=${selectedBeer.abv}>add to cart</button>
      </div>
    </div>
    `

    productsModalContainer.html(modalOutput)
  }

  beersContainer.on("click", ".card-img-wrapper-btn", displayProductsModal)

  // Close products modal
  const closeProductsModal = () => {
    productsModalContainer.removeClass("products-modal-active")
  }
  productsModalContainer.on("click", ".modal-close-btn", closeProductsModal)

  // Sort beer data
  const sortBeerData = () => {
    switch (sortByParam) {
      case "default":
        sortedBeers = beers
        break
      case "popularity":
        sortedBeers = beers.sort((a, b) => (a.target_fg > b.target_fg ? 1 : -1))
        break
      case "rating":
        sortedBeers = beers.sort((a, b) => (a.target_og > b.target_og ? 1 : -1))
        break
      case "date":
        sortedBeers = beers.sort((a, b) =>
          a.first_brewed > b.first_brewed ? 1 : -1
        )
        break
      case "abv-low":
        sortedBeers = beers.sort((a, b) => (a.abv > b.abv ? 1 : -1))
        break
      case "abv-high":
        sortedBeers = beers.sort((a, b) => (a.abv < b.abv ? 1 : -1))
        break
      default:
        sortedBeers = beers
    }
  }

  const sortBySelect = $("#sorting-select")

  sortBySelect.change(() => {
    sortByParam = sortBySelect.val()
    displayBeers()
  })

  // Fixed nav
  const nav = $(".nav")
  const backToTopBtn = $(".back-to-top-btn")

  $(window).on("scroll", () => {
    backToTopBtn.toggleClass("back-to-top-btn-fixed", this.scrollY >= 200)
    if ($(window).width() < 1024) {
      return
    } else {
      nav.toggleClass("header-nav-fixed", this.scrollY >= 200)
    }
  })

  // Show / hide nav links on mobile screen
  const navLinks = $(".nav-links")
  const navLinksContent = $(".nav-links-content")
  const navBtn = $(".nav-btn")
  const navLinksOverlay = $(".nav-links-overlay")

  navBtn.on("click", () => {
    navLinks.toggleClass("nav-links-active")
    navLinksContent.toggleClass("nav-links-content-active")
  })

  navLinksOverlay.on("click", () => {
    navLinks.removeClass("nav-links-active")
    navLinksContent.removeClass("nav-links-content-active")
  })

  // Links dropdown
  const navItems = $(".nav-item")
  $.each(navItems, (i, item) => {
    if ($(window).width() > 1024) {
      $(item).on("mouseenter", () => {
        const allDropdownLists = $(".dropdown")
        $.each(allDropdownLists, (i, list) => {
          $(list).removeClass("nav-link-dropdown-active")
        })

        const dropdownList = $(item).children().last()
        if (dropdownList.hasClass("dropdown")) {
          dropdownList.addClass("nav-link-dropdown-active")
        }
      })
      $(item).on("mouseleave", () => {
        const dropdownList = $(item).children().last()
        if (dropdownList.hasClass("dropdown")) {
          dropdownList.removeClass("nav-link-dropdown-active")
        }
      })
    }
    if ($(window).width() <= 1024) {
      $(item).on("click", (e) => {
        const target = $(e.target)
        if (target.hasClass("dropdown-link")) {
          return
        }
        // Close all dropdowns
        const arrow = $(item).children().first().children().last()
        arrow.css("transform", "rotateZ(-90deg)")

        $.each(navItems, (i, navItem) => {
          const itemLastChild = $(navItem).children().last()
          const arrow = $(navItem).children().first().children().last()

          if (navItem !== item) {
            if (itemLastChild.hasClass("nav-link-dropdown-active")) {
              itemLastChild.removeClass("nav-link-dropdown-active")
              arrow.css("transform", "rotateZ(90deg)")
            }
          }
          if (itemLastChild.hasClass("nav-link-dropdown-active")) {
            arrow.css("transform", "rotateZ(90deg)")
          }
        })

        // Open dropdown
        const itemLastChild = $(item).children().last()
        let dropdownList

        if (itemLastChild.hasClass("nav-link-dropdown")) {
          dropdownList = itemLastChild
        }
        if (dropdownList) {
          dropdownList.toggleClass("nav-link-dropdown-active")
        }
      })
    }
  })

  // Sublinks dropdown
  const dropdownLinks = $(".dropdown-link-double")
  $.each(dropdownLinks, (i, link) => {
    if ($(window).width() > 1024) {
      $(link).on("mouseenter", () => {
        const allDropdownSublinks = $(".sublinks")

        $.each(allDropdownSublinks, (i, sublinksList) => {
          $(sublinksList).removeClass("sublinks-active")
        })

        const dropdownList = $(link).children().last()
        if (dropdownList.hasClass("sublinks")) {
          dropdownList.addClass("sublinks-active")
        }
      })
      $(link).on("mouseleave", () => {
        const dropdownList = $(link).children().last()
        if (dropdownList.hasClass("sublinks")) {
          dropdownList.removeClass("sublinks-active")
        }
      })
    }
    if ($(window).width() <= 1024) {
      $(link).on("click", () => {
        // Close all sublinks
        $.each(dropdownLinks, (i, ddLink) => {
          const itemLastChild = $(ddLink).children().last()

          if (ddLink !== link) {
            itemLastChild.removeClass("sublinks-active")
          }
        })

        // Open / Close sublinks
        let sublinksList = $(link).children().last()
        sublinksList.toggleClass("sublinks-active")
      })
    }
  })

  // Scroll To Top
  backToTopBtn.on("click", () => {
    window.scrollTo(0, 0)
  })

  // Beers layout
  let beersLayout = "tiles"

  const setBeersLayout = () => {
    beersContainer.toggleClass("products-beers-list", beersLayout === "list")
  }

  $(".display-btn").click((e) => {
    $(e.target).hasClass("display-btn-list")
      ? (beersLayout = "list")
      : (beersLayout = "tiles")

    setBeersLayout()
  })

  // Set number of pages
  let numberOfPages = 1
  let pagesContainer = $(".pages-numbers")

  const setNumberOfPages = async () => {
    const response = await fetch("https://api.punkapi.com/v2/beers")
    const data = await response.json()
    let beersLength = data.length
    numberOfPages = Math.ceil(beersLength / 9)
    let pagesOutput = ""
    let startingNumber = 1
    let endingNumber = 4
    if (currentPage == 2) {
      startingNumber = 1
      endingNumber = 4
    } else if (currentPage > 2) {
      startingNumber = currentPage - 2
      endingNumber = currentPage + 1
    }

    const nextPageUrl = url.replace(
      `page=${currentPage}`,
      `page=${currentPage + 1}`
    )
    const nextPageResponse = await fetch(nextPageUrl)
    const nextPageData = await nextPageResponse.json()

    const secondNextPageUrl = url.replace(
      `page=${currentPage}`,
      `page=${currentPage + 3}`
    )
    const secondNextPageResponse = await fetch(secondNextPageUrl)
    const secondNextPageData = await secondNextPageResponse.json()

    const thirdNextPageUrl = url.replace(
      `page=${currentPage}`,
      `page=${currentPage + 3}`
    )
    const thirdNextPageResponse = await fetch(thirdNextPageUrl)
    const thirdNextPageData = await thirdNextPageResponse.json()

    if (thirdNextPageData.length === 0) {
      startingNumber = currentPage - 1
      endingNumber = currentPage + 1
    }

    if (secondNextPageData.length === 0) {
      startingNumber = currentPage - 1
      endingNumber = currentPage + 1

      if (currentPage == 1) {
        endingNumber = currentPage + 2
      }
    }

    if (nextPageData.length === 0) {
      startingNumber = currentPage - 3
      endingNumber = currentPage
    }

    if (startingNumber < 1) {
      startingNumber = 1
    }

    for (let i = startingNumber; i <= endingNumber; i++) {
      if (i === currentPage) {
        pagesOutput += `
        <li class="pages-numbers-item">
        <button class="pages-numbers-btn pages-numbers-btn-active">${i}</button>
        </li>
        `
      } else {
        pagesOutput += `
        <li class="pages-numbers-item">
        <button class="pages-numbers-btn">${i}</button>
        </li>
        `
      }
    }

    hidePagesBtns()
    pagesContainer.html(pagesOutput)
  }

  setNumberOfPages()

  // Set page
  const changePage = () => {
    pagesContainer.on("click", ".pages-numbers-btn", (e) => {
      let target = $(e.target)
      if (currentPage) {
        currentPage = +target.text().trim()
      }
      setUrl()
      hidePagesBtns()
    })
  }
  changePage()

  // Next page
  const nextPageBtn = $(".pages-btn-next")
  nextPageBtn.on("click", () => {
    currentPage += 1
    setUrl()
    hidePagesBtns()
  })

  // Prev page
  const prevPageBtn = $(".pages-btn-prev")
  prevPageBtn.on("click", () => {
    currentPage -= 1
    setUrl()
    hidePagesBtns()
  })

  // First page
  const firstPageBtn = $(".pages-btn-first")

  firstPageBtn.on("click", () => {
    currentPage = 1
    setUrl()
    hidePagesBtns()
  })

  // Hide unnecessary pages btns
  const lastPageBtn = $(".pages-btn-last")

  const hidePagesBtns = async () => {
    if (currentPage === 1) {
      firstPageBtn.css({ display: "none" })
      prevPageBtn.css({ display: "none" })
    } else {
      firstPageBtn.css({ display: "inline" })
      prevPageBtn.css({ display: "inline" })
    }

    const nextPageUrl = url.replace(
      `page=${currentPage}`,
      `page=${currentPage + 1}`
    )

    const nextPageResponse = await fetch(nextPageUrl)
    const nextPageData = await nextPageResponse.json()

    if (nextPageData.length != 0) {
      lastPageBtn.css({ display: "inline" })
      nextPageBtn.css({ display: "inline" })
    } else {
      lastPageBtn.css({ display: "none" })
      nextPageBtn.css({ display: "none" })
    }
  }
  hidePagesBtns()

  // Number of shown results
  const numberOfShownResultsContainer = $(".display-amount-shown")
  const setNumberOfShownResults = async () => {
    const response = await fetch(url)
    const data = await response.json()
    let endingIndex = currentPage * beersContainer.children().length
    let startingIndex = endingIndex - productsPerPage + 1

    if (startingIndex < 1) {
      startingIndex = 1
    }

    if (data.length === 0) {
      startingIndex = 0
      endingIndex = 0
    }

    let resultsOutput = `${startingIndex}-${endingIndex}`

    numberOfShownResultsContainer.html(resultsOutput)
  }
  setNumberOfShownResults()

  // Add to cart
  let cartItems = []

  const addItemToCart = () => {
    $(document).on("click", ".card-btn", (e) => {
      const target = $(e.target)
      const targetedItemID = target.attr("data-id")
      let changedItem
      let isItemInTheCart = false
      target.addClass("card-btn-active")
      setTimeout(() => {
        target.removeClass("card-btn-active")
      }, 2000)

      // If cartItems is not empty
      if (cartItems.length !== 0) {
        // Check if item is already in the cart
        $.each(cartItems, (i, item) => {
          if (item.beerID === targetedItemID) {
            isItemInTheCart = true
          }
        })
        if (isItemInTheCart) {
          // If item is already in the cart, increase its amount by 1
          changedItem = cartItems.filter(
            (cartItem) => cartItem.beerID === targetedItemID
          )[0]
          const indexOfChangedItem = cartItems.indexOf(changedItem)
          cartItems[indexOfChangedItem].beerAmount = changedItem.beerAmount + 1
        } else {
          // If item is not in the cart, add it to cart
          let beerObject = {
            beerID: target.attr("data-id"),
            beerTitle: target.attr("data-title"),
            beerImg: target.attr("data-img"),
            beerAbv: target.attr("data-abv"),
            beerAmount: 1,
          }
          cartItems = [...cartItems, beerObject]
        }

        // If cartItems is empty
      } else {
        let beerObject = {
          beerID: target.attr("data-id"),
          beerTitle: target.attr("data-title"),
          beerImg: target.attr("data-img"),
          beerAbv: target.attr("data-abv"),
          beerAmount: 1,
        }
        cartItems.push(beerObject)
      }
      sessionStorage.setItem("beerCart", JSON.stringify(cartItems))
      displayCartItems()
    })
  }
  addItemToCart()

  // Get cart items from session
  const getCartItemsFromSession = () => {
    cartItems = JSON.parse(sessionStorage.getItem("beerCart"))
    if (!cartItems) {
      cartItems = []
    }
  }

  // If any items are in the cart, display them. Otherwise, show empty cart notification
  const cartFullContainer = $(".cart-full")
  const cartEmptyNotification = $(".cart-empty")

  const setCartContainerContent = () => {
    if (cartItems.length === 0) {
      cartFullContainer.css({ display: "none" })
      cartEmptyNotification.css({ display: "block" })
    } else {
      cartFullContainer.css({ display: "flex" })
      cartEmptyNotification.css({ display: "none" })
    }
  }
  setCartContainerContent()

  // Remove item from cart
  $(document).on("click", ".item-remove-btn", (e) => {
    const target = $(e.target)
    let targetedItemID = target.attr("data-id")

    cartItems = cartItems.filter((item) => item.beerID !== targetedItemID)
    sessionStorage.setItem("beerCart", JSON.stringify(cartItems))
    displayCartItems()
    updateCartModal()
  })

  // Update cart total value
  const totalValueContainer = $(".cart-total-value")
  const updateTotalValue = () => {
    let totalSum = 0
    let totalOutput = ""

    $.each(cartItems, (i, cartItem) => {
      totalSum += cartItem.beerAmount * cartItem.beerAbv
    })

    totalSum = totalSum.toFixed(2)
    totalOutput = `$${totalSum}`
    totalValueContainer.html(totalOutput)
  }

  // Display cart items
  const cartItemsContainer = $(".cart-list")
  const displayCartItems = () => {
    getCartItemsFromSession()

    let cartOutput = ""

    $.each(cartItems, (i, cartItem) => {
      const { beerID, beerTitle, beerImg, beerAbv, beerAmount } = cartItem
      cartOutput += `
      <li class="cart-item item" data-id=${beerID}>
      <div class="item-img-wrapper">
        <img src=${beerImg} alt=${beerTitle} class="item-img" />
      </div>
      <div class="item-details">
        <h4 class="item-heading">${beerTitle}</h4>
        <p class="item-paragraph">
          <span class="item-amount">${beerAmount}</span>
          <span class="item-times">×</span>
          <span class="item-price">$${beerAbv}</span>
        </p>
      </div>
      <button class="item-remove-btn" data-id=${beerID}>×</button>
    </li>
      `
    })
    cartItemsContainer.html(cartOutput)

    setCartContainerContent()
    updateTotalValue()
  }
  displayCartItems()

  // Cart checkout
  const checkoutBtn = $(".cart-btn-checkout")
  const cartCheckout = () => {
    alert(`Your bill is ${totalValueContainer.text()}`)
    cartItems = []
    sessionStorage.setItem("beerCart", JSON.stringify(cartItems))
    displayCartItems()
    updateCartModal()
  }
  checkoutBtn.on("click", cartCheckout)

  // Display cart modal
  const cartModalContainer = $(".cart-modal")
  const displayCartModal = () => {
    cartModalContainer.addClass("cart-modal-active")
    updateCartModal()
  }

  const updateCartModal = () => {
    let cartModalOutput = ""
    let cartModalItemsOutput = ""
    let totalSum = 0

    if (cartItems.length === 0) {
      cartModalItemsOutput = `<p class="modal-cart-empty">No products in the cart</p>`
    }

    $.each(cartItems, (i, item) => {
      const { beerID, beerTitle, beerImg, beerAmount, beerAbv } = item
      totalSum += beerAmount * beerAbv

      cartModalItemsOutput += `
      <li class="modal-item item" data-id=${beerID}>
      <button class="item-remove-btn" data-id=${beerID} >×</button>
        <div class="item-img-wrapper">
          <img src=${beerImg} alt=${beerTitle} class="item-img" />
        </div>
        <h5 class="item-heading">${beerTitle}</h5>
        <div class="item-details">
          <div class="item-amount-container">
            <button class="item-amount-btn item-amount-increase-btn" data-id=${beerID}>
              <i class="fas fa-sort-up"></i>
            </button>
            <span class="item-amount">${beerAmount}</span>
            <button class="item-amount-btn item-amount-decrease-btn" data-id=${beerID}>
              <i class="fas fa-sort-down"></i>
            </button>
          </div>
          <span class="item-amount-times">×</span>
          <p class="item-price">$${beerAbv}</p>
        </div>
        <p class="item-total">$${(beerAmount * beerAbv).toFixed(2)}</p>
      </li>
      `
    })

    // Disable checkout if cart is empty
    let checkoutBtnOutput = ``
    totalSum > 0
      ? (checkoutBtnOutput = `<button class="cart-btn cart-btn-checkout modal-btn">checkout</button>`)
      : (checkoutBtnOutput = `<button class="cart-btn cart-btn-checkout modal-btn modal-btn-disabled">checkout</button>`)

    cartModalOutput = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <button class="modal-close-btn">×</button>
      <h3 class="modal-heading">Cart</h3>
      <ul class="modal-list">
        ${cartModalItemsOutput}
      </ul>
      <div class="modal-footer">
        <p class="modal-total">Subtotal: <span >$${totalSum.toFixed(
          2
        )}</span></p>
        ${checkoutBtnOutput}
      </div>
    </div>
    `

    cartModalContainer.html(cartModalOutput)
  }

  const displayCartModalBtn = $(".cart-btn-view")
  displayCartModalBtn.on("click", displayCartModal)

  // Close cart modal
  const closeCartModal = () => {
    cartModalContainer.removeClass("cart-modal-active")
  }
  cartModalContainer.on("click", ".modal-close-btn", closeCartModal)

  // Increase / Decrease amount in modal
  cartModalContainer.on("click", ".item-amount-btn", (e) => {
    const target = $(e.target)
    const targetedItemID = target.attr("data-id")
    let changedItem = cartItems.filter(
      (cartItem) => cartItem.beerID === targetedItemID
    )[0]
    const indexOfChangedItem = cartItems.indexOf(changedItem)

    if (target.hasClass("item-amount-increase-btn")) {
      cartItems[indexOfChangedItem].beerAmount = changedItem.beerAmount + 1
    } else {
      if (changedItem.beerAmount === 1) {
        return
      } else {
        cartItems[indexOfChangedItem].beerAmount = changedItem.beerAmount - 1
      }
    }
    sessionStorage.setItem("beerCart", JSON.stringify(cartItems))
    updateCartModal()
    displayCartItems()
  })

  // Checkout from modal
  cartModalContainer.on("click", ".cart-btn-checkout", cartCheckout)

  // Set number of products per page
  const productsPerPageSelect = $("#per-page-select")
  const setProductsPerPage = () => {
    productsPerPageSelect.on("change", (e) => {
      const target = $(e.target)
      productsPerPage = target.val()

      currentPage = 1
      hidePagesBtns()
      setUrl()
    })
  }
  setProductsPerPage()

  // Set URL
  // Search beers by name
  const searchInput = $(".search-input")
  let searchInputValue
  const searchBtn = $(".search-btn")

  searchBtn.on("click", () => {
    currentPage = 1
    setUrl()
  })
  searchInput.on("keyup", (e) => {
    if (e.keyCode == 13) {
      currentPage = 1
      setUrl()
    }
  })

  // Search beers by brewing date
  const dateBtn = $(".date-btn")
  const brewAfterInput = $("#brew-date-start")
  const brewBeforeInput = $("#brew-date-end")
  let brewBeforeDate, brewAfterDate

  dateBtn.on("click", () => {
    // Brew before
    if (brewBeforeInput.val()) {
      let brewBeforeYear = brewBeforeInput.val().substr(0, 4)
      let brewBeforeMonth = brewBeforeInput.val().substr(5, 2)
      brewBeforeDate = `${brewBeforeMonth}-${brewBeforeYear}`
    }

    // Brew after
    if (brewAfterInput.val()) {
      let brewAfterYear = brewAfterInput.val().substr(0, 4)
      let brewAfterMonth = brewAfterInput.val().substr(5, 2)
      brewAfterDate = `${brewAfterMonth}-${brewAfterYear}`
    }
    currentPage = 1
    setUrl()
  })

  // Abv slider
  const abvLowContainer = $("#abv-low")
  const abvHighContainer = $("#abv-high")
  let lowAbv, highAbv
  const setAbvFilter = () => {
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 100,
      step: 0.1,
      values: [0, 100],
      slide: function (event, ui) {
        $(abvLowContainer).val(ui.values[0])
        $(abvHighContainer).val(ui.values[1])
      },
    })
    $(abvLowContainer).val($("#slider-range").slider("values", 0))
    $(abvHighContainer).val($("#slider-range").slider("values", 1))
  }
  setAbvFilter()

  const abvBtn = $(".abv-btn")
  abvBtn.on("click", () => {
    currentPage = 1
    setUrl()
  })

  // Food btn
  const foodBtn = $(".food-btn")
  foodBtn.on("click", () => {
    currentPage = 1
    setUrl()
  })

  // Reset filters
  beersContainer.on("click", ".no-beers-btn", () => {
    url = baseUrl
    searchInput.val("")
    brewAfterInput.val(null)
    brewBeforeInput.val(null)
    displayBeers()
  })

  // When URL changes, scroll to top of products
  const scrollToProducts = () => {
    const productsY = $(".products").position().top - 50
    $(window).scrollTop(productsY)
  }

  const setUrl = () => {
    url = `https://api.punkapi.com/v2/beers?page=${currentPage}&per_page=${productsPerPage}`

    // Search filters
    searchInputValue = searchInput.val()

    // Food filters
    const foodValue = $("input[name=food]:checked").val()

    // Attach beer_name to url
    if (searchInputValue) {
      let searchInputValueAdapted = searchInputValue.replace(" ", "_")
      url = `${url}&beer_name=${searchInputValueAdapted}`
    }

    // Attach brewed_after to url
    if (brewAfterDate) {
      url = `${url}&brewed_after=${brewAfterDate}`
    }

    // Attach brewed_before to url
    if (brewBeforeDate) {
      url = `${url}&brewed_before=${brewBeforeDate}`
    }

    // Attach max abv to url
    lowAbv = $("#abv-low").val()
    highAbv = $("#abv-high").val()
    if (highAbv != maxAbv) {
      url = `${url}&abv_lt=${highAbv}`
    }
    // Attach min abv to url
    if (lowAbv != minAbv) {
      url = `${url}&abv_gt=${lowAbv}`
    }

    // Attach food to url
    if (foodValue) {
      url = `${url}&food=${foodValue}`
    }

    scrollToProducts()
    displayBeers()
  }

  // Close modals
  const closeModals = () => {
    $(window).on("click", (e) => {
      const target = $(e.target)
      if (target.hasClass("modal-overlay")) {
        closeCartModal()
        closeProductsModal()
      }
    })
    $(window).on("keyup", (e) => {
      if (e.keyCode == 27) {
        closeCartModal()
        closeProductsModal()
      }
    })
  }
  closeModals()
})
