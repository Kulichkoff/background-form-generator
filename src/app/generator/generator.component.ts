import { TestField, Choice, TestForm } from './../form-controller.service';
import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef, ViewRef } from '@angular/core';
import {TestCheckboxComponent} from "../test-checkbox/test-checkbox.component";
import {TestInputComponent} from "../test-input/test-input.component";
import {TestNumberComponent} from "../test-number/test-number.component";
import {TestSelectComponent} from "../test-select/test-select.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { FormControllerService } from '../form-controller.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss']
})
export class GeneratorComponent implements OnInit {

  // @ts-ignore
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef

  public testForm: TestForm = {
    title: '',
    components: []
  }
  
  components = []

  testCheckbox = TestCheckboxComponent
  testInput = TestInputComponent
  testNumber = TestNumberComponent
  testSelect = TestSelectComponent

  // Variables for creating component
  testField: TestField = {
    label: '',
    description: '',
    placeholder: '',
    required: false,
    choices: [],
    componentClass: null,
    isIncludeCheckAll: false
  }
  choicesText: string = ''

  constructor(private http: HttpClient, private componentFactoryResolver: ComponentFactoryResolver, private ngbModal: NgbModal, private formControllService: FormControllerService) {
    this.formControllService.removeComponentObs$.subscribe(
      componentId => {
        console.log('Generator has got a message for remove component ' + componentId)
        this.removeComponent(componentId)
      }
    )

    this.formControllService.moveComponentUp$.subscribe(
      componentId => {
        console.log('Generator has got a message for move component up ' + componentId)
        this.moveComponentUp(componentId)
      }
    )

    this.formControllService.moveComponentDown$.subscribe(
      componentId => {
        console.log('Generator has got a message for move component up ' + componentId)
        this.moveComponentDown(componentId)
      }
    )
  }

  addComponent(componentClass: any) {
    // Create component dynamically inside the ng-template
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass)
    const component = this.container.createComponent(componentFactory)

    let choicesArray = this.choicesText.split(',')

    let choices: Choice[] = []
    choicesArray.forEach((choice, idx) => {
      choices.push(
        {id: idx, title: choice, active: false}
      )
    })

    this.testField.choices = choices
    this.testField.componentClass = componentClass
    this.formControllService.initTestField(this.testField)
    this.testForm.components.push(this.testField)

    // Empty all
    this.choicesText = ''
    this.testField = {
      label: '',
      description: '',
      placeholder: '',
      required: false,
      choices: [],
      componentClass: null,
      isIncludeCheckAll: false
    }

    // @ts-ignore
    this.components.push(component);
  }

  removeComponent(componentId: number) {
    // Find the component
    // @ts-ignore
    const component = this.components.find((component) => component.instance.componentId === componentId);
    // @ts-ignore
    const componentIndex = this.components.indexOf(component);

    if (componentIndex !== -1) {
      this.container.remove(componentIndex);
      this.components.splice(componentIndex, 1);
      this.testForm.components.splice(componentIndex, 1);
    }
  }

  moveComponentUp(componentId: number) {

    // Find the component
    // @ts-ignore
    const component = this.components.find((component) => component.instance.componentId === componentId);
   
    // @ts-ignore
    const componentIndex = this.components.indexOf(component);

    if (componentIndex !== -1 && componentIndex > 0) {
      // Get ViewRef object
      // @ts-ignore
      const componentViewRef: ViewRef = component['hostView']
      
      this.container.move(componentViewRef, componentIndex - 1);
      
      // Swap components in array
      const temp = this.components[componentIndex - 1]
      this.components[componentIndex - 1] = this.components[componentIndex]
      this.components[componentIndex] = temp

      const ttemp = this.testForm.components[componentIndex - 1]
      this.testForm.components[componentIndex - 1] = this.testForm.components[componentIndex]
      this.testForm.components[componentIndex] = ttemp
    }
  }

  moveComponentDown(componentId: number) {
    // Find the component
    // @ts-ignore
    const component = this.components.find((component) => component.instance.componentId === componentId);
    // @ts-ignore
    const componentIndex = this.components.indexOf(component);

    if (componentIndex !== -1 && componentIndex < this.components.length - 1) {
      // Get ViewRef object
      // @ts-ignore
      const componentViewRef: ViewRef = component['hostView']
      
      this.container.move(componentViewRef, componentIndex + 1);
      
      // Swap components in array
      const temp = this.components[componentIndex + 1]
      this.components[componentIndex + 1] = this.components[componentIndex]
      this.components[componentIndex] = temp

      const ttemp = this.testForm.components[componentIndex + 1]
      this.testForm.components[componentIndex + 1] = this.testForm.components[componentIndex]
      this.testForm.components[componentIndex] = ttemp
    }

  }


  openModal(content: any): void {
    this.ngbModal.open(content)
  }

  saveForm() {
    console.log('saveForm() works!')
    this.http.post("http://localhost:3000/api/json", this.testForm).subscribe(() => {})
  }

  ngOnInit(): void {
  }

}

