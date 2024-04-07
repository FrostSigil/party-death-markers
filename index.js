
module.exports = function PartyDeathMarkers(mod) {
	let members = [];
	let markers = [];

	mod.game.on("enter_game", removeAllMarkers);

	mod.hook("S_PARTY_MEMBER_LIST", "*", event => {
		members = event.members;
	});

	mod.hook("S_DEAD_LOCATION", "*", event => {
		spawnMarker(members.find(member => member.gameId === event.gameId), event.loc);
	});

	mod.hook("S_SPAWN_USER", "*", event => {
		if (!event.alive)
			spawnMarker(members.find(member => member.gameId === event.gameId), event.loc);
	});

	mod.hook("S_PARTY_MEMBER_STAT_UPDATE", "*", event => {
		if (mod.game.me.playerId === event.playerId)
			return;

		if (markers.length > 0 && event.alive && event.curHp > 0)
			removeMarker(members.find(member => member.playerId === event.playerId));
	});

	mod.hook("S_EACH_SKILL_RESULT", "*", event => {
		if (event.skill.id === 60410102 || event.skill.id === 120100) {
			removeMarker(members.find(member => member.gameId === event.target));
		}
	});

	mod.hook("S_LEAVE_PARTY_MEMBER", "*", event => {
		removeMarker(members.find(member => member.playerId === event.playerId));
	});

	mod.hook("S_LEAVE_PARTY", "*", () => {
		removeAllMarkers();
		members = [];
	});

	function spawnMarker(member, loc) {
		if (!member || mod.game.me.is(member.gameId))
			return;

		removeMarker(member);
		markers.push(member.playerId);

		mod.toClient("S_SPAWN_DROPITEM", "*", {
			gameId: member.playerId,
			loc: loc.addN(0, 0, -100),
			item: getMarker(member.class),
			amount: 1,
			expiry: 0,
			owners: [{ playerId: mod.game.me.playerId }]
		});
	}

	function getMarker(classid) {
		switch (classid) {
			case 1:
			case 10:
				return 46703;
			case 6:
			case 7:
				return 89141;
			default:
				return 89604;
		}
	}

	function removeMarker(member) {
		if (!member)
			return;

		const id = member.playerId;
		if (markers.includes(id)) {
			mod.toClient("S_DESPAWN_DROPITEM", "*", {
				gameId: id
			});
			markers = markers.filter(marker => marker !== id);
		}
	}

	function removeAllMarkers() {
		members.forEach(member => removeMarker(member));
		markers = [];
	}
};