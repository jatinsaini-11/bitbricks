// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract RealEstate {

    //STATE VARIABELS
    struct Property {
        uint256 propertyID;
        address owner;
        uint256 price;
        string propertyTitle;
        string category;
        string images;
        string propertyAddress;
        string description;
        address[] reviewers;
        string[] reviews;
        address bitbricks;
    }

    //MAPPING
    mapping(uint256 => Property) private properties;
    uint256 public propertiesIndex;

    //EVENTS
    event PropertyListed(uint256 indexed id, address indexed owner, uint256 price);
    event PropertySold(uint256 indexed id, address indexed owner, address indexed newOwner, uint256 price);
    event PropertyResold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);

    //REVIEWS_SECTION
    struct Review{
        address reviewers;
        uint256 productId;
        uint256 rating;
        string comment;
        uint256 likes;
    }
    struct Product{
        uint256 productId;
        uint256 totalRating;
        uint256 numReviews;
    }

    mapping(uint256 => Review[] ) private reviews;
    mapping(address => uint256[] ) private userReviews;
    mapping(uint256 => Product ) private products;

    uint256 public reviewsCounter;
    
    event ReviewAdded(uint256 productId, address indexed reviewers, uint256 rating, string comment);
    event ReviewLiked(uint256 productId, address indexed liker, uint256 indexed reviewIndex, uint256 likes);
    

    //PROPERTIES LISTING AND DISPLAY
    function listProperty(address owner, uint256 price, string memory _propertyTitle, string memory _propertyAddress, string memory _category, string memory _images, string memory _description) external returns (uint256){
        require(price > 0, "Price must be greater than 0");
        uint256 productId = propertiesIndex++;
        Property storage property = properties[productId];
        
        property.propertyID = productId;
        property.owner = owner;
        property.price = price;
        property.propertyTitle = _propertyTitle;
        property.category = _category;
        property.images = _images;
        property.propertyAddress = _propertyAddress;
        property.description = _description;

        emit PropertyListed(productId, owner, price);
        return productId;
    }
    function updateProperty(address owner, uint256 productId, string memory _propertyTitle, string memory _category, string memory _images, string memory _propertyAddress, string memory _description) external returns (uint256){
        Property storage property = properties[productId];
        require(property.owner == owner, "You are not the owner");

        property.propertyTitle = _propertyTitle;
        property.category = _category;
        property.images = _images;
        property.propertyAddress = _propertyAddress;
        property.description = _description;

        return productId;
    }
    function updatePrice(address owner, uint256 productId, uint256 price) external returns(string memory){
        Property storage property = properties[productId];
        require(property.owner == owner, "You are not the owner");

        property.price = price;
        return "Your property price updated";
    }
    function buyProperty(uint256 id, address buyer, address bitbricks) external payable{
        uint256 amount = msg.value;
        require(amount >= properties[id].price, "Insuffiecient funds");

        Property storage property = properties[id];
        (bool sent,) = payable(property.owner).call{value: amount}("");

        uint256 commission = (properties[id].price * 2) / 100;
        
        if(sent) {
            property.owner = buyer;
            (bool sentCommission,) = payable(bitbricks).call{value: commission}("");
            require(sentCommission, "Commission transfer failed");
            emit PropertySold(id, property.owner, buyer, amount);
        }
    }
    function getAllProperty() public view returns(Property[] memory){
        uint256 itemCount = propertiesIndex;
        uint256 currentIndex = 0;

        Property[] memory items = new Property[](itemCount);
        for(uint256 i=0; i<itemCount; i++) {
            uint256 currentId = i + 1;
            Property storage currentItem = properties[currentId];
            items[currentIndex] = currentItem;
        }

        return items;
    }
    function getProperty(uint256 id) external view returns(uint256, address, uint256, string memory, string memory, string memory, string memory, string memory){
        Property memory property = properties[id];
        return (
            property.propertyID,
            property.owner,
            property.price,
            property.propertyTitle,
            property.category,
            property.images,
            property.propertyAddress,
            property.description
        );
    }
    function getUserProperties(address user) external view returns(Property[] memory){
        uint256 totalItemCount = propertiesIndex;
        uint256 itemCount  = 0;
        uint256 currentIndex = 0;
        for(uint256 i = 0; i < totalItemCount ; i++ ) {
            if (properties[i+1].owner == user){
                itemCount += 1;
            }
        }
        Property[] memory items = new Property[] (itemCount);
        for(uint256 i = 0; i<totalItemCount; i++) {
            if(properties[i+1].owner == user) {
                uint256 currentId = i + 1;
                Property storage currentItem = properties[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    
    //REVIEWS
    function addReview(uint256 productId, uint256 rating, string calldata comment, address user) external{
        require(rating >= 1 && rating <= 5, "The rating must be between 1 and 5");
        
        Property storage property = properties[productId];
        property.reviewers.push(user);
        property.reviews.push(comment);

        //REVIEWSECTION
        reviews[productId].push(Review(user, productId, rating, comment, 0));
        userReviews[user].push(productId);
        products[productId].totalRating += rating;
        products[productId].numReviews++;

        emit ReviewAdded(productId, user, rating, comment);
        reviewsCounter++;
    }
    function getPropertyReview(uint256 productId) external view returns(Review[] memory){
        return reviews[productId];
    }
    function getUserReview(address user) external view returns(Review[] memory){
        uint256 totalReviews = userReviews[user].length;
        Review[] memory userProductReviews = new Review[] (totalReviews);
        for(uint256 i = 0; i < userReviews[user].length; i++) {
            uint256 productId = userReviews[user][i];
            Review[] memory productReview = reviews[productId];
            for(uint256 j = 0; j < productReview.length; j++ ) {
                if( productReview[j].reviewers == user ) {
                    userProductReviews[i] = productReview[j];
                }
            }
        }
        return userProductReviews;
    }
    function likeReview(uint256 productId, uint256 reviewIndex, address user) external{
        Review storage review = reviews[productId][reviewIndex];
        review.likes++;
        emit ReviewLiked(productId, user, reviewIndex, review.likes);
    }
    function getHighestratedReview() external view returns(uint256){
        uint256 highesRatedProduct = 0;
        uint256 highesRatedProductId = 0;
        for(uint256 i = 0; i < reviewsCounter; i++) {
            uint256 productId = i + 1;
            if (products[productId].numReviews > 0) {
                uint256 avgRating = products[productId].totalRating / products[productId].numReviews;
                if(avgRating > highesRatedProduct) {
                    highesRatedProduct = avgRating;
                    highesRatedProductId = productId;
                }
            }
        } 
        return highesRatedProductId;
    }
}