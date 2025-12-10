# Category and Subcategory Field Matrix

This matrix lists the editable fields the AI should populate for each category and subcategory. Every ad still carries the global defaults (`title`, `description`, `category`, `subcategory`, `location`, `price`, `contact_phone`, `contact_email`, `images`); the fields below are **additional** knobs that change as the user switches category/subcategory.

| Category | Subcategory | Editable Fields (category-level first, then subcategory specifics) |
| --- | --- | --- |
| Real Estate | Rent Residential | Bedrooms, Bathrooms, Floor area, Floor level, Furnishing, Construction year, Heating type, Energy class, Pets allowed, Deposit months |
| Real Estate | Sell Residential | Bedrooms, Bathrooms, Floor area, Plot size, Floor level, Construction year, Renovation year, Heating type, Energy class, Parking spots, Storage rooms |
| Real Estate | Rent Commercial | Property type, Floor area, Floor level, Construction year, Heating/cooling, Parking spots, Commercial permits, Frontage width |
| Real Estate | Sell Commercial | Property type, Floor area, Plot size, Floor level, Construction year, Renovation year, Heating/cooling, Parking spots, Commercial permits, Frontage width |
| Real Estate | Land Lease | Zoning, Plot size, Buildable area, Frontage width, Utilities available (water/power/sewage), Slope, Access road type |
| Real Estate | Land Sale | Zoning, Plot size, Buildable area, Frontage width, Utilities available (water/power/sewage), Slope, Access road type |
| Real Estate | Parking Rent | Parking type (indoor/outdoor), Space type (single/double), EV charger, Height clearance, Security features, Access control |
| Real Estate | Parking Sale | Parking type (indoor/outdoor), Space type (single/double), EV charger, Height clearance, Security features, Access control |
| Vehicles | Car | Make, Model, Year, Mileage, Fuel type, Transmission, Drivetrain, Body type, Doors, Seats, Emission standard, Service history, Owner type |
| Vehicles | Taxi | Make, Model, Year, Mileage, Fuel type, Transmission, Taxi license status, Taximeter installed, Retrofit date, Owner type |
| Vehicles | Motorcycle | Make, Model, Year, Mileage, Engine displacement, Engine type, Power, Cooling, Transmission, ABS, Service history |
| Vehicles | Light Truck (≤7.5t) | Make, Model, Year, Mileage, Gross weight, Fuel type, Transmission, Drive configuration, Body type (box/flatbed), Payload, Tail lift, Euro class |
| Vehicles | Heavy Truck (>7.5t) | Make, Model, Year, Mileage, Gross weight, Fuel type, Transmission, Axle configuration, Body type, Payload, Sleeper cab, Tail lift, Euro class |
| Vehicles | Bus | Make, Model, Year, Mileage, Fuel type, Transmission, Seats, Standing capacity, Wheelchair ramp, Toilets, Climate control |
| Vehicles | Loader / Forklift | Make, Model, Year, Operating hours, Power source, Lifting capacity, Mast type, Lift height, Fork length, Cab type |
| Vehicles | Construction Vehicle | Make, Model, Year, Operating hours, Machine type, Operating weight, Engine power, Tracks/Wheels, Attachments, Service history |
| Vehicles | Agricultural Vehicle | Make, Model, Year, Operating hours, Machine type, Engine power, PTO power, Drive type, Hydraulics, Attachments, Cab/ROPS |
| Vehicles | Tractor Unit | Make, Model, Year, Mileage, Engine power, Fuel type, Transmission, Axle configuration, Fifth-wheel height, Sleeper cab, Euro class |
| Vehicles | Trailer | Trailer type, Year, Length, Width, Axles, Suspension, Brakes, Max payload, Loading system, Floor type |
| Vehicles | Semi-Trailer | Trailer type, Year, Length, Width, Axles, Suspension, Brakes, Max payload, Loading system, Floor type |
| Vehicles | Camper / Caravan | Make, Model, Year, Mileage, Fuel type, Transmission, Berths, Beds, Kitchen, Bathroom, Fresh/grey water capacity, Heating/cooling |
| Vehicles | Boat | Make, Model, Year, Length, Beam, Hull material, Engine type, Engine count, Engine hours, Fuel type, Berths, Cabins, Draft, Trailer included |
| Vehicles | Airplane | Manufacturer, Model, Year, Airframe hours, Engine type, Engine hours, Seats, Avionics suite, IFR/VFR, Last inspection, Hangared, Damage history |
| Vehicles | Other Vehicle | Vehicle type, Make, Model, Year, Mileage/Hours, Fuel/Power source, Transmission, Key equipment |
| Vehicles | Car Parts | Part type, Compatible make/model/years, OEM/aftermarket, Condition, Part number, Warranty |
| Vehicles | Motorcycle Parts | Part type, Compatible make/model/years, Engine size compatibility, Condition, Part number, Warranty |
| Vehicles | Commercial Parts | Part type, Compatible vehicle classes, Condition, Part number, Warranty, Certification |
| Services | Education & Tutoring | Subject area, Level (primary/secondary/adult), Delivery mode (online/in-person), Duration per session, Certifications, Languages taught, Availability |
| Services | Home Care & Cleaning | Service type, Team size, Supplies included, Coverage area, Visit frequency, Emergency call-out, Insurance/bonding |
| Services | Construction & Renovation | Trade specialty, License number, Insurance, Team size, Service area, Project types, Site visit offered, Earliest start date |
| Services | Office Support & Logistics | Service type, Coverage area, Hours of operation, SLA/response time, Certifications, Tools/vehicles provided |
| Services | Creative & Media | Specialty, Portfolio link, Tools/technologies, Delivery formats, Revisions included, Turnaround time |
| Services | IT & Engineering | Specialty, Tech stack, Certifications, Remote/on-site, SLA/response time, Security clearance, Availability |
| Services | Food Service & Catering | Cuisine type, Meal types (breakfast/lunch/dinner), Diet options, Headcount range, Staffing included, Equipment provided, Health permits |
| Services | Transport & Couriers | Vehicle type, Payload/seat capacity, Service area, Licensing, Insurance, Tracking available, Response time |
| Services | Beauty & Wellness | Specialty, Certifications, Products used, Mobile/on-site, Hygiene protocols, Patch test offered, Booking window |
| Services | Security & Safety | Service type, Licensing, Insurance, Staff training, Equipment provided, Patrol schedule, Emergency response time |
| Services | Sports & Outdoor | Specialty, Certification level, Group size, Equipment provided, Difficulty level, Terrain/water type, Insurance |
| Services | Business & Consulting | Specialty, Certifications, Industries served, Engagement model, Team size, Availability, NDA offered |
| Goods | Business for Sale | Business type, Industry, Years operating, Annual revenue, EBITDA, Employees, Inventory included, Assets included, Reason for sale |
| Goods | Business Equipment | Equipment type, Brand, Model, Year, Condition, Hours used, Maintenance history, Power requirements, Accessories included |
| Goods | Office Equipment | Item type, Brand, Model, Year, Condition, Duty cycle/throughput, Connectivity, Accessories included |
| Goods | Industrial Machinery | Machine type, Brand, Model, Year, Condition, Hours, Power requirements, Capacity/specs, Accessories included |
| Goods | Professional Licenses | License type, Jurisdiction, Valid through, Transferability, Scope/limitations, Documentation provided |
| Goods | Furniture | Furniture type, Material, Dimensions, Style, Color, Condition, Assembly required |
| Goods | Appliances | Appliance type, Brand, Model, Year, Energy class, Dimensions, Capacity, Condition, Warranty |
| Goods | Art & Antiques | Item type, Artist/period, Material, Dimensions, Provenance, Condition, Certificate of authenticity |
| Goods | Kitchen & Cookware | Item type, Material, Set size, Heat sources compatible, Dishwasher/oven safe, Condition |
| Goods | Building Materials | Material type, Grade/spec, Dimensions/quantity, Color/finish, Certification, Storage conditions |
| Goods | Home Decor | Item type, Material, Dimensions, Color/finish, Style, Mounting included, Condition |
| Goods | Home Repair Tools | Tool type, Brand, Model, Power source, Capacity/specs, Condition, Accessories |
| Goods | Household Services Packages | Service type, Team size, Supplies included, Coverage area, Visit frequency, Insurance |
| Goods | Computers | Form factor, Brand, Model, CPU, RAM, Storage, GPU, OS, Screen size, Condition, Warranty |
| Goods | Mobile Phones | Brand, Model, Storage, RAM, Color, Carrier/lock, Battery health, Dual SIM, Condition, Warranty |
| Goods | Audio Systems | Device type, Brand, Model, Power output, Inputs, Wireless features, Dimensions, Condition |
| Goods | Televisions | Brand, Model, Screen size, Panel type, Resolution, HDR formats, Smart TV platform, Ports, Condition |
| Goods | Photography | Item type, Brand, Model, Sensor/format, Mount, Shutter count, Accessories, Condition |
| Goods | PC Peripherals | Peripheral type, Brand, Model, Connection type, Key specs (DPI/polling rate/resolution), Compatibility, Condition |
| Goods | Mobile Accessories | Accessory type, Device compatibility, Material, Color, Wireless/charging specs, Condition, Warranty |
| Goods | Musical Instruments | Instrument type, Brand, Model, Size/scale, Material, Electronics/pickups, Case included, Condition |
| Goods | Gaming | Platform, Title/accessory type, Edition, Region/compatibility, Online features, Condition |
| Goods | Books/Media | Media type, Title, Author/artist, Edition/pressing, Language, ISBN/identifier, Condition |
| Goods | Hunting | Item type, Caliber/draw weight, Length, Material, Optics included, Safety certifications, Condition |
| Goods | Collections | Collection type, Item count, Era/series, Certification/grading, Storage condition, Provenance |
| Goods | Travel Gear | Item type, Capacity, Dimensions, Material, Weight, Wheels/handles, TSA locks, Condition |
| Goods | Camping | Item type, Capacity, Season rating, Material, Packed size/weight, Included accessories, Condition |
| Goods | Hobbies | Hobby type, Skill level, Kit contents, Materials included, Safety notes, Condition |
| Goods | Bicycles | Type (road/MTB/etc.), Brand, Model, Frame size, Frame material, Wheel size, Groupset, Suspension, Brake type, Mileage, Upgrades |
| Goods | Gym Equipment | Equipment type, Brand, Model, Resistance/weight range, Dimensions, Foldable, Condition, Accessories |
| Goods | Cycling Accessories | Accessory type, Size, Material, Compatibility, Safety ratings, Weight, Condition |
| Goods | Sportswear | Item type, Gender, Size, Material, Season, Color, Condition |
| Goods | Ski & Snowboard | Item type, Brand, Model, Length/size, Flex, Bindings included, DIN range, Condition |
| Goods | Other Sports | Sport type, Item type, Size, Material, Certification/safety rating, Condition |
| Goods | Pets – Dogs | Breed, Age, Sex, Vaccinated, Microchipped, Pedigree papers, Neutered, Temperament, House-trained |
| Goods | Pets – Birds | Species, Age, Sex, Hand-raised, Ringed, Vocal ability, Cage included, Health tests |
| Goods | Pets – Cats/Other | Species/breed, Age, Sex, Vaccinated, Microchipped, Neutered, Pedigree papers, Temperament, Litter trained |
| Goods | Pet Accessories | Accessory type, Size, Material, Compatible species, Color, Condition |
| Goods | Health – Doctors/Nurses | Specialty, License number, Location/telehealth, Insurance accepted, Availability, Languages, Experience years |
| Goods | Health Products & Equipment | Item type, Brand, Model, Medical certification, Expiry date (consumables), Usage history, Condition |
| Goods | Organic Products | Product type, Certification, Ingredients, Weight/volume, Expiry date, Packaging, Allergens |
| Goods | Beauty Services | Service type, License/certification, Products used, Hygiene protocols, Mobile/on-site, Patch test, Booking window |
| Goods | Elderly Care | Service type, Certifications, Experience years, Live-in/live-out, Languages, Availability, Driving license |
| Goods | Fashion – Watches | Brand, Model, Reference number, Movement, Case size/material, Bracelet material, Water resistance, Box/papers, Condition |
| Goods | Fashion – Bags | Brand, Model, Size, Material, Color, Year, Authenticity proof, Condition |
| Goods | Fashion – Clothing | Item type, Gender, Size, Fit, Material, Color, Pattern, Season, Condition |
| Goods | Fashion – Shoes | Item type, Gender, Size, Material, Color, Sole type, Condition |
| Goods | Fashion – Jewelry | Type, Material, Stone type, Weight, Size, Certification, Condition, Packaging |
| Goods | Fashion – Accessories | Accessory type, Material, Color, Size, Condition, Brand |
| Goods | Fashion – Baby/Kids | Item type, Age range, Size, Material, Safety certifications, Condition |
| Goods | Fashion – Wedding/Baptism | Item type, Size, Material, Color, Designer, Accessories included, Condition |
| Goods | Personal – Dating | Gender, Age, Orientation, Interests, Languages, Location, Availability, Preferences |
| Goods | Personal – Flatshare | Room type, Room size, Furnishing, Bills included, Flatmates, Deposit, Minimum stay, Amenities, House rules |
| Goods | Personal – Matchmaking | Service type, Age range served, Location focus, Membership duration, Background checks, Meeting facilitation, Privacy policy |
| Goods | Personal – Astrology | Service type, Method (natal chart/tarot/etc.), Session length, Delivery (online/in-person), Reports included, Follow-up availability |
