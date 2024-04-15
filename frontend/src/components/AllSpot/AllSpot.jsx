import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSpotsThunk } from "../../store/spots";
import SpotTile from '../SpotTile/SpotTile';
import "./AllSpot.css";
import SearchBox from "../Navigation/SearchBox/SearchBox";

function AllSpots() {
	const [searchField, setSearchField] = useState("");
	const dispatch = useDispatch();
	const spotsObj = useSelector((state) => state.spots);
	const spots = spotsObj ? Object.values(spotsObj) : [];

	useEffect(() => {
		dispatch(getAllSpotsThunk());
	}, [dispatch]);

	const filteredSpots = useSelector((state) =>
		state.spots
			? Object.values(state.spots).filter((spot) =>
					spot.name.toLowerCase().includes(searchField.toLowerCase())
			  )
			: []
	);

	const onSearchChange = (event) => {
		setSearchField(event.target.value);
	};

	if (!spots.length) {
		return null;
	}

	return (
		<div className="all-spots-container">
			<SearchBox
				className="search-box"
				onChangeHandler={onSearchChange}
				placeholder="Search Spots..."
			/>
			{filteredSpots.map((spot) => (
				<div className="single-spot-tile" key={spot.id}>
					<SpotTile spot={spot} />
				</div>
			))}
		</div>
	);
}

export default AllSpots;
