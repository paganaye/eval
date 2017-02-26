class ClassA {
   value: number = 0;

   setValue(newValue: number) {
      this.value = newValue;
   }

   test() {
      if (this.value !== 0) throw 'Error';
      this.setValue(1);
      if (this.value == 1) alert('Value has changed')
   }
}

var a = new ClassA();

a.test();