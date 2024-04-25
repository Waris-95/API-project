# **🏠 CzyBnB**

CzyBnB is a full-stack web application inspired by Airbnb. It allows users to create spots, add reviews, offering a diverse range of accommodations for exploration.

## [🚀 Live Site: CzyBnB](https://auth-me-3ebb.onrender.com/)

## Table of Contents

- [🌟 MVP Feature List](#mvp-feature-list)
- [💡 Database Schema](#database-schema)
- [📚 User Stories](#user-stories)
- [🔗 API Docs](#api-docs)
- [🛠️ Technologies Used](#technologies-used)
- [🌅 Landing Page](#landing-page)
- [🏞️ One Spot Page and Reviews](#one-spot-page-and-reviews)
- [💻 Code I'm Proud Of](#code-im-proud-of)
- [🚀 Getting Started](#getting-started)
- [✨ Features](#features)
- [📞 Contact](#contact)

## [🌟 Feature List](https://github.com/Waris-95/czybnb/wiki/Features-List)

Explore the minimum viable product feature list required for CzyBnB.

## [💡 Database Schema](https://github.com/Waris-95/czybnb/wiki/Database-Schema)

Discover the schema of the PostgreSQL database powering CzyBnB.

## [📚 User Stories](https://github.com/Waris-95/czybnb/wiki/User-Stories)

Immerse yourself in captivating user stories, detailing each feature's journey and acceptance criteria.

## [🔗 API Docs](https://github.com/Waris-95/czybnb/wiki/API-Routes)

Browse the API documentation for JSON data interaction between frontend and backend routes.

## 🛠️ Technologies Used

<div style="display:flex">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" style="width:50px" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" style="width:50px" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" style="width:50px" /> 
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" style="width:50px" /> 
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" style="width:50px" /> 
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" style="width:50px" /> 
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sequelize/sequelize-original.svg" style="width:50px" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" style="width:50px" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" style="width:50px" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/1119b9f84c0290e0f0b38982099a2bd027a48bf1/icons/socketio/socketio-original-wordmark.svg" style="width:50px" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" style="width:50px" /> 
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg" style="width:50px" />
</div>

## 🌅 Live Preview

![Landing Page GIF](https://github.com/Waris-95/Czybnb/assets/124799691/c768b822-717a-4438-88c8-b96b40b72a55)

## 💻 Code I'm Proud Of

```javascript

// GET all spots with query filters
/* This route retrieves spots with optional query filters
such as latitude, longitude, price range, etc. It performs a query based
on the provided filters and returns paginated results along with average
ratings and preview images for each spot. */

router.get('/', validateQueryParams, async (req, res, next) => {
  try {
    // Get the query params
    let {
      page = 1,
      size = 20,
      minLat,
      maxLat,
      minLng,
      maxLng,
      minPrice,
      maxPrice,
    } = req.query;

    page = parseInt(page, 10);
    size = parseInt(size, 10);

    // Create the where clause
    const whereClause = {
      ...(minLat && { lat: { [Sequelize.Op.gte]: parseFloat(minLat) } }),
      ...(maxLat && { lat: { [Sequelize.Op.lte]: parseFloat(maxLat) } }),
      ...(minLng && { lng: { [Sequelize.Op.gte]: parseFloat(minLng) } }),
      ...(maxLng && { lng: { [Sequelize.Op.lte]: parseFloat(maxLng) } }),
      ...(minPrice && { price: { [Sequelize.Op.gte]: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { [Sequelize.Op.lte]: parseFloat(maxPrice) } }),
    };

    // Perform the query
    const spotsData = await Spot.findAndCountAll({
      where: whereClause,
      attributes: {
        include: [
          [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating'],
        ],
      },
      include: [
        {
          model: Review,
          attributes: [],
        },
        {
          model: SpotImage,
          as: 'SpotImages',
          attributes: ['url'],
          where: { preview: true },
          required: false,
        },
      ],
      // Group by the primary keys of the Spot and SpotImages tables
      group: ['Spot.id', 'SpotImages.id'],
      limit: size,
      offset: (page - 1) * size,
      subQuery: false,
      distinct: true,
    });

    // Format the spots to be returned to the client
    const spots = spotsData.rows.map((spot) => {
      const previewImage =
        spot.SpotImages && spot.SpotImages.length > 0
          ? spot.SpotImages[0].url
          : null;
      // Cast the avgRating to a float and round to a single decimal point
      const avgRating = spot.dataValues.avgRating
      ? parseFloat(spot.dataValues.avgRating).toFixed(1)
      : null;
    return {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: parseFloat(spot.lat),
      lng: parseFloat(spot.lng),
      name: spot.name,
      description: spot.description,
      price: parseFloat(spot.price),
      createdAt: spot.createdAt.toISOString(), // Add createdAt field in ISO string format
      updatedAt: spot.updatedAt.toISOString(), // Add updatedAt field in ISO string format
      avgRating: avgRating !== null ? parseFloat(avgRating) : null, // Ensure avgRating is not returned as a string
      previewImage: previewImage,
    };

    });

    res.status(200).json({
      Spots: spots,
      page, 
      size,
    });
  } catch (error) {
    next(error);
  }
});
```

# 🚀 Getting Started

1. Clone this repository: [CzyBnB Repository](https://github.com/Waris-95/czybnb)
2. Install dependencies for the backend and frontend by navigating to each directory in separate terminals and running `npm install`.
3. Create a `.env` file using the provided `.envexample`.
4. Set up your database with information from your `.env` file and then run the following commands:
   - `npx dotenv sequelize db:create`
   - `npx dotenv sequelize db:migrate`
   - `npx dotenv sequelize db:seed:all`
5. Start the app for both backend and frontend using `npm start`.
6. Now you can use the Demo User or Create an account.

## ✨ Features

### Spots

- Users can create a Spot.
- Users can read/view other Spots.
- Users can update their Spot.
- Users can delete their Spot.

### Reviews

- Users can create Reviews on Spots.
- Users can read/view all of the Reviews on a Spot.
- Users can delete their Review(s) on a Spot.
