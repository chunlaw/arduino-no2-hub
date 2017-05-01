#include <Wire.h>
#include <UnoWiFiDevEd.h>
#include <EEPROM.h>
#include "MutichannelGasSensor.h"
#define TOPIC_ID "no2/d6e5a46a"

struct SID{
  char topic_id[10];
};

SID setter = { TOPIC_ID };
SID getter;

void setup() {
  Serial.begin(9600);  // start serial for output
  Wifi.println("power on!");
  Wifi.begin();
  gas.begin(0x04);
  gas.powerOn();

  
  EEPROM.put(0, setter);
  EEPROM.get(0, getter);
  Serial.println(getter.topic_id);
  Ciao.begin();
}

void loop() {
  // put your main code here, to run repeatedly:
  float c;

  c = gas.measure_NO2();
  Wifi.print("The concentration of NO2 is ");
  if(c>=0) Wifi.print(c);
  else Wifi.print("invalid");
  Wifi.println(" ppm");
  Ciao.write("mqtt", TOPIC_ID, String(c) );

  delay(1000);
}
