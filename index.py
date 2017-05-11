import Adafruit_DHT
import time

while True:
	hum, temp = Adafruit_DHT.read_retry(Adafruit_DHT.DHT11, 4)

	hum = round(hum, 2)
	temp = round(temp, 2)

	if hum is not None and temp is not None:
		print 'Temp = {0:0.1f}*C Luchtvochtigheid = {1:0.1f}%'.format(temp, hum)	
	else:
		print 'Kan sensor niet uitlezen!'
	time.sleep(1)
