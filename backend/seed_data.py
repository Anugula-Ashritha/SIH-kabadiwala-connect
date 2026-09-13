from database import SessionLocal
import models

db = SessionLocal()

recyclers = [
    models.Recycler(
        organization_name="GreenCycle Recycling Hub",
        location="Mayapuri, Delhi",
        materials_accepted="PCB,Cables,LCD/LED",
        authorization_status="VERIFIED",
        pickup_available=1
    ),
    models.Recycler(
        organization_name="EcoLoop E-Waste Centre",
        location="Kirti Nagar, Delhi",
        materials_accepted="PCB,Batteries,Mobile",
        authorization_status="VERIFIED",
        pickup_available=1
    ),
    models.Recycler(
        organization_name="Urban E-Recovery Centre",
        location="Okhla, Delhi",
        materials_accepted="Cables,PCB,Mixed Plastics",
        authorization_status="VERIFIED",
        pickup_available=0
    )
]

for recycler in recyclers:
    db.add(recycler)

db.commit()
db.close()

print("Demo recyclers added successfully.")